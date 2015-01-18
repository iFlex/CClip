//TODO: optimize transactions
function net(){
	this.status = "uninitialised";
	var requests = ["0","1","2"];//0 store, 1 get, 2 authenticate
	var ready = false;
	var ctx = this;

	var user = "iFlex";
	var pwd = "test";
	var server = "127.0.0.1";
	var port = 2022;
	
	var socket = 0;
	var maxTimeout = 10000;
	var timeout = 1000;
	var increment = 100;
	var net = require('net');

	var onDataReady = 0;

	function onData(data){
		try{
			onDataReady(data);
		}
		catch(e){

		}
		
	}
	function onConnect(){
		console.log('Net: Connected 2 server!');
  		ctx.status = "connected";
  		ready = true;

  		//authenticate
  		var _crypto = pwd;
  		socket.write(requests[2]+user+"/"+_crypto);
	}
	function onEnd(){
		console.log("Net: Connection ended!");
		ctx.status = "disconnected";
		ready = false;
	}
	function onError(){
		ctx.status = "errored";
		ready = false;
	}

	this.start = function(){
		if(socket)
			this.stop();

		ctx.status = "starting";
		console.log("Net: connecting to "+server+":"+port);
		socket = net.connect({port: port, host:server},onConnect);

		socket.on('data', onData );
		socket.on('end', onEnd );
		socket.on('error', onError );
	}
	
	this.send = function(data){
		if(ready && socket)
		{
			var dta = new Buffer(requests[0]+data);
			var result = socket.write(dta);
		}
	}
	
	this.get = function(callback){
		if(ready && socket)
		{
			var result = socket.write(requests[1]);
			onDataReady = callback;
			console.log("Asked for remote clipboard");
		}
	}

	this.stop = function(){
		if(ready && socket)
			socket.destroy();
		else
			console.log("Net: Socket already closed!");
		socket = 0;
		ready = false;
		console.log("Net: disconnected from "+server+":"+port);
	}
}

module.exports = new net();