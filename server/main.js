const PORT=8109;
const MAX_PACKET_SIZE = 2048;
//HTTP
var packet = require('../common/packet');
var Packet = new packet();
var http = require('http');
var mime = require('mime');
var server = http.createServer(handleRequest);
var io = require('../node_modules/socket.io')(server);
var serverOps = require("./serverOps");
var sender = require("./sender");
var receiver = require("./receiver");

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
    if( packet.t === "server_request"){//server request
      console.log("handling server request");
      console.log(packet);
      serverOps.handleServerRequest(socket,packet);
    } else {
      if(!packet.r) {//broadcast to user's devices
        sender.sync(data,user,socket);
      } else { //routed packet
        packet.s = user;//add sender identity
        sender.route(packet,user);
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

var shared = {activeUsers:activeUsers,socketToUser:socketToUser,userBridge:userBridge,sql:connection,Packet:Packet};
sender = new sender(shared);
receiver = new receiver(shared);

shared.sender = sender;
shared.receiver = receiver;
serverOps = new serverOps(shared);
