const PORT=8094;
const MAX_PACKET_SIZE = 2048;
//HTTP
var packet = require('../common/packet');
var http = require('http');
var mime = require('mime');
var server = http.createServer(handleRequest);
var io = require('../node_modules/socket.io')(server);
var serverOps = require("./serverOps");
var utils = new (function(){
  this.makeAuthToken = function(length){
    token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0;i<length;++i)
        token += possible.charAt(Math.floor(Math.random() * possible.length));
    return token;
  }
})();
//Database support
var mysql      = 0;
var connection = 0;
function connectToDB(){
	try {
		mysql = require('mysql');
		connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : '',
			database : 'webshow'
		});
		connection.connect();
	} catch ( e ){
		console.log("ERROR: could not connect to the database. Users can not be authenticated! Abort!",e);
	}
}
//connectToDB();
console.log(utils.makeAuthToken(64));
//////////////////
function handleRequest(request, response){
    try {
			//do nothing
    } catch(err) {
        console.log(err.stack);
    }
}
//////////////////
var activeUsers = {};
var socketToUser = {};
//TODO: deactivate bridge after stream is complete
var userBridge = {};//dictates who can forward to who
function authenticate(user,pass,success,failure){
	success(utils.makeAuthToken(64));
}

function activateUser(user,socket,token,handlerFunction) {
	if(!activeUsers[user])
		activeUsers[user] = {};

	socket.on(user,handlerFunction);
	activeUsers[user][socket] = [socket,token];
	socketToUser[socket] = user;
}

function deactivateUser(user,socket){
	if(activeUsers[user] && activeUsers[user][socket]){
    try {
      socket.disconnect();
		  delete activeUsers[user][socket];
		  delete socketToUser[socket];
      return;
    } catch(e){
      console.log("#ROGUE USER");
    }
  }
  socket.disconnect();
}

io.on('connection', function (socket) {
	console.log("New connection");
	var Packet = new packet();
	var timeout = 0;
	timeout = setTimeout(function(){
		console.log("Auth timeout");
    socket.disconnect();
	},500);

	function serveUser(data){
    if(data.length > MAX_PACKET_SIZE){
      deactivateUser(socketToUser[socket],socket);
      return;
    }

		var user = socketToUser[socket]
    var packet = Packet.fromRaw(data);
    if( packet.t == "server_request"){//server request
      serverOps.handleServerRequest(socket,data);
    } else {
      if(!packet.r) {//broadcast to user's devices
        var destinations = activeUsers[user];
        for( k in destinations)
			     if( destinations[k][0] !== socket)
				       destinations[k][0].emit(user,data);
      } else { //routed packet
        packet.s = user;//add sender identity
        data = Packet.toRaw(packet);//repackage data
        for( recipient in packet.r ) {// for each user in the recipient list
          if(userBridge[user][recipient]) {//if sender is allowed to talk to recipient
            var destinations = activeUsers[recipient];//forward
            for( k in destinations )
  			       destinations[k][0].emit(recipient,data);
          }
        }
      }
    }
  }

  socket.on('auth', function (data) {
    if(data.length > MAX_PACKET_SIZE){
      deactivateUser(socketToUser[socket],socket);
      return;
    }

		console.log("New auth request");
		console.log(data);
		data = Packet.fromRaw(data);
		if( data.user && data.password )
			authenticate(data.user,data.password,function(token){
					console.log("Auth success");
					clearTimeout(timeout);
					activateUser(data.user,socket,token,serveUser);
			},function(){
				console.log("Auth failure for:"+data.user);
				clearTimeout(timeout);
				socket.disconnect();
			});
	});
});

//listen
server.listen(PORT, function(){
    console.log("Server listening on port:%s", PORT);
});
serverOps = new serverOps({activeUsers:activeUsers,socketToUser:socketToUser,userBridge:userBridge,sql:connection});
