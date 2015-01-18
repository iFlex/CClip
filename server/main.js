//TODO: add fast store for up to a one kilobyte per user in RAM
function net(){
	var net = require('net');
	var fs = require('fs');

	this.status = "uninitialised";
	var requests = ["0","1","2"];//0 store, 1 get, 2 authenticate
	var ready = false;
	var ctx = this;
	var clientTimeout = 2000;

	var port = 2020;
	var server = "127.0.0.1";
	var clients = {};
	
	function decreaseClients(soc){
		if(clients[soc.owner])
		{
			clients[soc.owner]--;
			if(!clients[soc.owner])
				delete clients[soc.owner];
		}
	}
	function auth(c,data){
		data = data.toString();
		if( data[0] == requests[2] )
		{
			//if auth success
			clearTimeout(c.expires);
			data = data.substr(1,data.length);
			data = data.split("/");
			
			if(!clients[data[0]])
				clients[data[0]] = 0;
			clients[data[0]]++;

			c.owner = data[0];
			c.busy = false;
			c.removeAllListeners(['data']);
			c.on('data',function(data){onRequest(c,data)});
			console.log(c.owner+" - has logged in");
		}
	}
	
	function onRequest(soc,data){
		data = data.toString();
		if(data[0] == requests[0] && !soc.busy)//store - if writer is busy copying data from pervious request, this one is discarded :(
		{
			console.log("("+soc.owner+"):store");
			soc.busy = true;
			fs.writeFile("./"+soc.owner, data.substr(1,data.length), function(err) { if(err) console.log("("+soc.owner+"):FILE_WRITE_ERROR:"+err); soc.busy = false;});
		}
		if(data[0] == requests[1] )//retrieve
		{
			console.log("("+soc.owner+"):fetch");
			fs.readFile("./"+soc.owner,'utf8', function(err, d) {
				if(err) {console.log("("+soc.owner+"):FILE_READ_ERROR:"+err); d="";};
				soc.write(d.toString());
			});
		}
	}

	function onClientConnect(c,i){
		console.log("New user has connected. Awaiting auth...");
		c.expires = setTimeout(function(){c.destroy();},clientTimeout);
		c.on('data',function(data){
			auth(c,data);
		});
		c.on('error',function(){ decreaseClients(c); c.destory();});
		c.on('end',function(){ decreaseClients(c); console.log(c.owner+" - ended connection"); c.destroy(); });
	}
	this.start = function(){
		ctx.status = "starting";
		server = net.createServer({ allowHalfOpen: false},onClientConnect);
		server.listen(port, function(){ ready = true; ctx.status = "listening"});
		console.log("Stargint clipboard server on port:"+port);
	}

	this.stop = function(){
		if(ready)
			server.close();
		else
			console.log("Net: Server already closed!");
	}

	this.changePort = function(newPort){
		this.stop();
		port = newPort;
		this.start();
	}
}

var s = new net();
s.start();