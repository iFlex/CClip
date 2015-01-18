//hook format:
//{ key:'c',specials:['ctrl'],callback:<function>}
function monitor(){
	var keypress = require('./lib/keypress');
	var hooks = {};
	var context;
	function recognise(ch,key){
		//get the hooks set for the pressed key
		//console.log(key.name,key);
		var hook = hooks[key.name];
		if(hook)
		{
			var doCall = true;
			for( f in hook.callbacks )
			{
				//for every hook set 
				doCall = true;	
				if( hook.callbacks[f].specials )
				{
					//check if the all the special keys are pressed
					for( spc in hook.callbacks[f].specials )
						if( !key[ hook.callbacks[f].specials[spc] ] )
						{	
							doCall = false;
							break;
						}
				}
				//call the handler
				if(doCall)
					hook.callbacks[f].handler();
			}
		}
	}
	this.start = function(){
		context = this;
		keypress(process.stdin);
		process.stdin.on('keypress', recognise);
		process.stdin.setRawMode(true);
		process.stdin.resume();
	}
	this.stop = function(){
		process.stdin.pause();
	}
	this.addHook = function(ptrn){
		if(!hooks[ptrn.key])
			hooks[ptrn.key] = {callbacks:[]};
		hooks[ptrn.key].callbacks.push({specials:ptrn.specials,handler:ptrn.callback});
	}
}
module.exports = new monitor();