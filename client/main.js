//read config
require('./lib/include-path')('./lib');
var lastClipboard = 0;

var fs = require('fs');
var clipb = require('copy-paste');
var cli = require('./cli');
//var net = require('./net');
var client = require('./client');

var executor = new (function(){
	this.publishClipboard = function(){
		function onClipboardIn(a,data){
			console.log("Sent Clipboard to remote.");
			Client.send({d:data});
		}
		clipb.paste(onClipboardIn);
	}

	this.pullClipboard = function(){
		console.log("pulling clipboard data");
		function clipboardReady(){
			console.log("Clipboard updated!");
		}
		if(lastClipboard)
			clipb.copy(lastClipboard,clipboardReady);
	}
})();

var config = {};
try {
	var bfr = fs.readFileSync('config.json');
	config = JSON.parse(bfr.toString('utf8',0,bfr.length));

	var Client = new client(config.server+":"+config.port,bufferInboundClipboard);
	Client.auth("lili","lala");

	for( cmd in config.commands )
		config.commands[cmd] = executor[config.commands[cmd]];
	cli.run(config.commands);
}
catch(e){
	console.log("Could not load configuration.\n"+e);
}

function bufferInboundClipboard(data){
	console.log("New inbound clipboard data");
	lastClipboard = data.d;
}
