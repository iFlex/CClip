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
    sock.on('data',function(data){});
    sock.on('drain',null);
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

function processControlPackets(sock,packets){
    for(var i=0; i<packets.length;++i){
        if(packets[i].getType() == 0){
            //ToDo - process command
        } else if(packets[i].getType() == 1){
            processFileTransferCommand(sock,packets[i]);
            //ToDo - deal with the rest of the packets
            return;
        } else if(packets[i].getType() == 2){
            //ToDo - streaming for the future
        }
    }
}

function linkFileTransferCallbacks(sock,writer){
    sock.pipe(writer);
}

function linkControlCallbacks(sock){
    var buffer = null;
    var packet = new Packet();
    var packets = [];
    
    function checkPacketReadyness(){
        if(packet.isComplete()){
            packets.push(packet);
            packet = new Packet();
        }
    }
    sock.on('data',function(data){
        while(buffer = packet.digest(buffer)){
            checkPacketReadyness();       
        }
        buffer = packet.digest(data);
        checkPacketReadyness();
        processControlPackets(sock,packets);
    });
}

function isConnectionExpected(sock){
    return true;
}

const server = net.createServer((c) => {
    if(!isConnectionExpected(c)) {
        c.end();
        return;
    }

    unauthSoc.push({socket:c})
    console.log('client connected');
    
    //linkAuthCallbacks();
    linkControlCallbacks(c);
    c.on('close',function(){
        c.end(); 
    });
    c.on('error',function(){
        c.end(); 
    });
    c.on('timeout',function(){
        c.end(); 
    });
});

server.on('error', (err) => {
    throw err;
});

server.listen(PORT, () => {
    console.log('server bound to ' + PORT);
});