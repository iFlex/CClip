module.exports = function(Packet, onPacket, onEnd, onError){
    function linkControlCallbacks(sock){
        var socket = 0;
        var buffer = null;
        var packet = new Packet();
        var packets = [];
        
        function checkPacketReadyness(){
            if(packet.isComplete()){
                packets.push(packet);
                packet = new Packet();
            }
        }
        
        function onData(data){
            while(buffer = packet.digest(buffer)){
                checkPacketReadyness();       
            }
            buffer = packet.digest(data);
            checkPacketReadyness();
            onPacket(sock,packets);
        }

        this.takeOver = function (sock) {
            socket = sock;
            socket.on('data',onData);
            c.on('close',function(){
                onEnd(c,"close"); 
            });
            c.on('error',function(err){
                onError(c,err); 
            });
            c.on('timeout',function(){
                onError(e,"timeout"); 
            });
            c.on('end',function(){
                onEnd(e,"end"); 
            });
        }

        this.setOnPacketCallback = function(onPkt){
            onPacket = onPkt;
        }
    }
}