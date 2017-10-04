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
const MGT_PORT = process.argv[2];
const PORT = 8012;

console.log("Connecting to mgmt port:"+MGT_PORT);
var mgtsocket = null;
try{
    mgtsocket = net.createConnection(MGT_PORT,function(err){
        mgtsocket.on("data",function(data){
            console.log("MANAGEMENT DATA:"+data);
        });
        mgtsocket.on("error",function(err){
            console.log("E:"+err);
        });
    });
} catch(e){
    console.log("CONNECTION TO MANAGER FAILED:"+e);
    console.error(e);
}

var sockets = {}
var unauthSoc = [];

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
        processFileTransferCommand(sock,packet);
    } else if(packet.getType() == 2){
        //
    }
}

function linkFileTransferCallbacks(sock,writer){
    sock.pipe(writer);
}

function isConnectionExpected(sock){
    return true;
}

function onConnErr(sock){

}

function onConnEnd(sock){
    
}

const packetReader = new PacketReader(Packet,processControlPackets,onConnEnd,onConnErr);
const server = net.createServer((c) => {
    if(!isConnectionExpected(c)) {
        c.end();
        return;
    }

    unauthSoc.push({socket:c})
    console.log('client connected');
    
    //autHandler.takeOver();
    packetReader.takeOver(c);
    //
});

server.on('error', (err) => {
    throw err;
});

server.listen(PORT, () => {
    console.log('server bound to ' + PORT);
});