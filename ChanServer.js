/*
Server for channel management
*/
module.exports = new function(){
    //utils
    const net     = require("net");
    const childProcess = require("child_process");

    var channels = {};

    var inChannelToBind = null;
    var unboundChannelInxed = -1;
    var connectTimeout = null;
    
    //DEFAULTS
    var PORT = 8080;
    var CHANNEL_CONNECT_WAIT = 60000;
    var server = null;
    
    function instantiate(rootPath,params,args){
        for(var i = 1; i < params.length; ++i){
            params[i] = params[i].replace("/%/",rootPath);
        }

        for(var i = 0; i < args.length; ++i ){
            params.push(args[i]);
        }

        console.log(params);
        return childProcess.spawn(params[0],params.splice(1),{
            detached:true
            ,shell:false
        });
    }

    function channelConnectTimedOut(){
        console.log("Channel failed to connect to manager. Aborting...");
        var chanDef = channels[inChannelToBind].in
        var result = chanDef.process.kill();
        chanDef.process = null;
        chanDef.socket = null;
        inChannelToBind = null;

        console.log("ChannelExitCode:"+result);
        bindNextChannel();
    }

    function bindNextChannel(){
        unboundChannelInxed++;
        var keys = Object.keys(channels);
        
        if(unboundChannelInxed < keys.length){
            inChannelToBind = keys[unboundChannelInxed];
            console.log("STARTING IN:Channel "+inChannelToBind);

            var inChann = channels[inChannelToBind].in;
            inChann.process = instantiate(channels[inChannelToBind].rootdir,inChann.instantiation,[PORT])
            
            if(inChann.process == null){
                console.error("FAILED TO INSTANTIATE CHANNEL:"+inChannelToBind);
            } else {
                console.log("Waiting for channel to connect to manager");
                connectTimeout = setTimeout(channelConnectTimedOut,CHANNEL_CONNECT_WAIT);
            }
        }
    }

    function configureNewInChannel(chanDef){
        console.log("Configuring:"+chanDef.name);
    }

    function onNewChannelConnect(socket){
        if(!inChannelToBind){
            console.log("REFUSING UNINVITED CONNECTION");
            socket.end();
        } else {
            if(connectTimeout)  {
                clearTimeout(connectTimeout);
                connectTimeout = null;
            }

            console.log("NEW CHANNEL REGISTERED WITH MANAGEMENT SERVER");
            channels[inChannelToBind].socket = socket;
            configureNewInChannel(channels[inChannelToBind]);
            inChannelToBind = null;
            
            bindNextChannel();
        }
    }

    this.sendFile = function(channelName,connDetails){
        var chandef = channels[channelName];
        if(!chandef){
            console.log("Inexistent channel:"+channelName);
            return;
        }
        var pid = instantiate(chandef.rootdir,chandef.out.instantiation,connDetails);
        if(!pid){
            return false;   
        }
        if(!chandef.out.active){
            chandef.out.active = [];
        }
        chandef.out.active.push(pid);

        return true;
    }

    this.configure = function(opts){
        if(!opts)
            return;

        if(opts.port){
            PORT = opts.port;
        }
        if(opts.channels){
            channels = opts.channels;
        }
    }

    this.start = function(){
        const server = net.createServer(onNewChannelConnect);        
        server.on('error', (err) => {
            console.error(err);
            //throw err;
        });
        server.listen(PORT, () => {
            console.log('ChannelServer listening on port '+PORT);
            bindNextChannel();
        });
    }
}();
