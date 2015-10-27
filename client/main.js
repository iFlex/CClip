//read config
require('./lib/include-path')('./lib');
var fs = require('fs');
var clipb = require('copy-paste');
var cli = require('./cli');
//var net = require('./net');
var client = require('./client');
var receiver = require('./receiver');
var sender = require('./sender');
var executor = new (function(){
	this.publishClipboard = function(){
		function onClipboardIn(a,data){
			console.log("Sent Clipboard to remote.");
			sender.sendRawData(data);
		}
		clipb.paste(onClipboardIn);
	}

	this.pullClipboard = function(){
		console.log("pulling clipboard data");
		function clipboardReady(){
			console.log("Clipboard updated!");
		}
		clipb.copy(receiver.getLastClipboard(),clipboardReady);
	}

	this.pushFile = function(name){
		sender.sendFile(name);
	}

	this.requestBridge = function(target){
		var data = {t:"server_request",request:"bridge",action:"open",r:target}
		sender.send(data);
	}

	this.exit = function(){
		process.exit();
	}
})();

if(process.argv.length < 4){
	console.log("Please provide username and password as arguments");
	process.exit();
}

var config = {};
try {
	var bfr = fs.readFileSync('config.json');
	config = JSON.parse(bfr.toString('utf8',0,bfr.length));
	if(process.argv.length == 5)
		config.port = process.argv[4];
		
	var Client = new client(config.server+":"+config.port,receiver.onNewPacket);
	Client.auth(process.argv[2],process.argv[3]);
	sender = new sender(Client);

	for( cmd in config.commands )
		config.commands[cmd] = executor[config.commands[cmd]];
	cli.run(config.commands);
}
catch(e){
	console.log("Could not load configuration.\n"+e);
}
