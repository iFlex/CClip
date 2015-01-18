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
	console.log("Fetched clipboard from remote."+typeof(data));
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


kmon.addHook({key:'v',specials:['ctrl'],callback:onClipboardRequired});
kmon.addHook({key:'c',specials:['ctrl'],callback:onClipboardEvent});
kmon.addHook({key:'x',specials:['ctrl'],callback:onClipboardEvent});
kmon.addHook({key:'o',specials:['ctrl'],callback:function(){net.start();} });
kmon.addHook({key:'p',specials:['ctrl'],callback:function(){net.stop();}});
kmon.addHook({key:'z',specials:['ctrl'],callback:function(){kmon.stop();net.stop();process.exit();}});


if( config.shortcuts ){
	try{
	for( k in config.shortcuts ){
		var hook = {specials:[]};
		for( c in config.shortcuts[k] ){
			if( config.shortcuts[k][c].length == 1 )
				hook.key = config.shortcuts[k][c];
			else
				hook.specials.push(config.shortcuts[k][c].toLower());
		}
		console.log("cfg("+k+"):"+hook);
		if(k == "exit")
			hook.callback = function(){
				config.stop();
			}
		config.addHook(hook);
	}
	}
	catch(e){
	}
}
console.log("Clipboard monitor running");
console.log("stop network link - ctrl + p");
console.log("start network link - ctrl + o");
kmon.start();