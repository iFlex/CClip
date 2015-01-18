//read config
require('./lib/include-path')('./lib');
var fs = require('fs');
var clipb = require('copy-paste');
var kmon = require('./monitor');
var net = require('./net');

var config = {};
try{
	var bfr = fs.readFileSync('config.json');
	config = JSON.parse(bfr.toString('utf8',0,bfr.length));
}
catch(e){
	console.log("Could not load configuration.\n"+e);
}	

function clipboardReady(){
	//console.log("Done! Clipboard updated!");
}
//puts data in clipboard
function onClipboardOut(data){
	//slow but works for now
	var str = "";
	for( i = 0 ; i < data.length; ++i )
		str += String.fromCharCode(data[i]);
	console.log("Fetched clipboard from remote.");
	clipb.copy(str,clipboardReady);
}
function onClipboardRequired(){
	net.get(onClipboardOut);
}

//take data from clipboard
function onClipboardIn(a,data){
	console.log("Sent Clipboard to remote.");
	net.send(data);
}
function onClipboardEvent(data){
	clipb.paste(onClipboardIn);
}

function exit(){
	kmon.stop();net.stop();process.exit();
}
//applying configuration
if( config.commands ){
	try{
		if(config.server)
			net.setServer(config.server);
		if(config.port)
			net.setPort(config.port);
		
		for( k in config.commands ){
			console.log("cfgcmd:"+k);
			var hook = {specials:[]};
			for( c = 0; c < config.commands[k].length; ++c )
			{
				if( config.commands[k][c].length == 1 )
					hook.key = config.commands[k][c];
				else
					hook.specials.push(config.commands[k][c]);
			}
			if(k == "exit")
				hook.callback = exit;
			if(k == "netstop")
				hook.callback = net.stop;
			if(k == "netstart")
				hook.callback = net.start;
			if(k == "copy")
				hook.callback = onClipboardEvent; 
			if(k == "paste")
				hook.callback = onClipboardRequired;
			
			kmon.addHook(hook);
		}
	}
	catch(e){
		console.log("Failed to apply configuration:"+e);
		console.log("Use ctrl+z to exit");
		kmon.addHook({key:'z',specials:['ctrl'],callback:exit});
	}
}
console.log("Clipboard monitor running");
console.log("stop network link - ctrl + p");
console.log("start network link - ctrl + o");
kmon.start();