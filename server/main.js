const PORT=8084;

//HTTP
var packet = require('../common/packet');
var http = require('http');
var mime = require('mime');
var server = http.createServer(handleRequest);
var io = require('../node_modules/socket.io')(server);
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
		socket.disconnect();
		delete activeUsers[user][socket];
		delete socketToUser[socket];
	}
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
		console.log("New data from user");
		console.log(data);
		var user = socketToUser[socket]
		var destinations = activeUsers[user];
		for( k in destinations)
			//if(k != socket)
				destinations[k][0].emit(user,data);
	}

  socket.on('auth', function (data) {
		console.log("New auth request");
		console.log(data);
		data = Packet.fromBase64(data);
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
