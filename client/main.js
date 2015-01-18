//read config
require('./lib/include-path')('./lib');
var fs = require('fs');
var config = {};
try{
	var bfr = fs.readFileSync('config.json');
	config = JSON.parse(bfr.toString('utf8',0,bfr.length));
}
catch(e){
	console.log("Could not load configuration.\n"+e);
}
console.log(config);
	
var clipb = require('./lib/node-clipboard');

function onClipboardEvent(){
	console.log("clipboard");
}

var kmon = require('./monitor');
kmon.start();
kmon.addHook({key:'c',specials:['ctrl'],callback:onClipboardEvent});
kmon.addHook({key:'x',specials:['ctrl'],callback:onClipboardEvent});
kmon.addHook({key:'z',specials:['ctrl'],callback:function(){kmon.stop();}});

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