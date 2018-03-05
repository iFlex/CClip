/*
1. Load up command line parameters
 file path
 target ip
 target port

2. Start reading chunks of the file and send
3. Report success
*/

const process = require("process");
const fs      = require("fs");
const net     = require("net");
const Packet  = require("./packet");
const PacketReader = require("./packet_reader");
//load  - parameters
console.log(process.argv);
const MGT_PORT = process.argv[2];
const PORT = 8117;

console.log("Connecting to mgmt port:"+MGT_PORT);
var mgtsocket = null;
try{
    mgtsocket = net.createConnection(MGT_PORT,function(err){
        /*mgtsocket.on("data",function(data){
            console.log("MANAGEMENT DATA:"+data);
        });*/
        var mgmtPacketReader = new PacketReader(Packet,
            function(sock,packet){
                handleMgmtControlPacket(packet);
            },function(e){
                console.log("MGMT CONNECTION DIED");
                process.exit(0);
            },function(err){
                console.log("E:"+err);
        });
        console.log(mgmtPacketReader)
        
        mgmtPacketReader.takeOver(mgtsocket);       
    });
} catch(e){
    console.log("CONNECTION TO MANAGER FAILED:"+e);
    console.error(e);
}
var sockets = {}
var unauthSoc = [];
var expectedCons = [];

const packetReader = new PacketReader(Packet,processControlPackets,onConnEnd,onConnErr);

function handleMgmtControlPacket(packet){
    var info = JSON.parse(packet.getDetails());
    info.type = packet.getType();
    console.log("Expecting connection")
    console.log(info);
    //todo clense
    expectedCons.push(info);
}


function clearCallbacks(sock){
    sock.on('data',null);
    sock.on('drain',null);
    sock.on('close',null);
    sock.on('error',null);
    sock.on('timeout',null);
    sock.on('end',null)
}

function processFileTransferCommand(sock,packet){
    clearCallbacks(sock);
    var writer = fs.createWriteStream(paget.getDetails(), {flags: 'w',
        encoding: 'binary',
        fd: null,
        mode: 0o666,
        autoClose: true
    });
    
    if(!writer){
        sock.end();
    } else {
        linkFileTransferCallbacks(sock,writer);
    }
}

function processControlPackets(sock,packet){
    if(packet.getType() == 0){
        //
    } else if(packet.getType() == 1){
        console.log("DEETS:"+packet.getDetails());
        processFileTransferCommand(sock,packet);
    } else if(packet.getType() == 2){
        //
    }
}

function linkFileTransferCallbacks(sock,writer){
    sock.pipe(writer);
}

function isConnectionExpected(sock){
    var details = sock.address();
    for(var i = 0; i < expectedCons.length; ++i ){
        if(expectedCons[i].host == details.address && expectedCons[i].port == details.port){
            if(expectedCons[i].type == 1){
                var writer = fs.createWriteStream(details.file, {flags: 'w',
                    encoding: 'binary',
                    fd: null,
                    mode: 0o666,
                    autoClose: true
                });
                console.log("Writer:"+typeof writer);
                return new PacketReader(Packet,writer,onConnEnd,onConnErr);
            }
            return packetReader;
        }
    }
    return null;
}

function onConnErr(sock){

}

function onConnEnd(sock){
    
}

const server = net.createServer((c) => {
    console.log("client connection");
    console.log(c);
    nextHandler = isConnectionExpected(c);
    if(!nextHandler) {
        c.end();
        return;
    }

    //unauthSoc.push({socket:c})
    //autHandler.takeOver();
    nextHandler.takeOver(c);
    //
});

server.on('error', (err) => {
    throw err;
});

server.listen(PORT, () => {
    console.log('server bound to ' + PORT);
});