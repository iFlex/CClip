module.exports = function(Packet, onPacket, onEnd, onError){
        var socket = 0;
        var buffer = null;
        var packet = new Packet();
        var packets = [];
        
        function onData(buffer){
            packet.digest(buffer);
            if(packet.isComplete()){
                onPacket(socket,packet);
            } else {
                console.log("PARTIAL PACKET")
            }
        }

        this.takeOver = function (sock) {
            socket = sock;
            if(typeof onPacket != "function"){
                socket.pipe(onPacket);
            } else {
                socket.on('data',onData);
            }
            socket.on('close',function(){
                onEnd(socket,"close"); 
            });
            socket.on('error',function(err){
                onError(socket,err); 
            });
            socket.on('timeout',function(e){
                onError(socket,e,"timeout"); 
            });
            socket.on('end',function(e){
                onEnd(socket,e,"end"); 
            });
        }

        this.setOnPacketCallback = function(onPkt){
            onPacket = onPkt;
        }
}