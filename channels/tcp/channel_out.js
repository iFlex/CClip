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
const PacketReader = require("./packet_reader");

const MGT_PORT = process.argv[2];
console.log("Connecting to mgmt port:"+MGT_PORT);
var mgtsocket = null;
try {
    mgtsocket = net.createConnection(MGT_PORT,function(err){
        mgtsocket.on("data",function(data){
            console.log("MANAGEMENT DATA:"+data);
        });
        mgtsocket.on("error",function(err){
            console.log("E:"+err);
        });
    });
} catch(e) {
    console.log("CONNECTION TO MANAGER FAILED:"+e);
    console.error(e);
}

function filesend(RCV_PORT,RCV_HOST,FILENAME){
    const CHUNK_SIZE = 1400;
    var socket;
    var fd;
    
    var READ = 0;
    var SENT = 0;
    var READ_ATTEMPT = 0;
    var SEND_ATTEMPT = 0;
    var RAM_QUEUE_SIZE = 1024*1024*800;
    var TOTAL_FILE_SIZE = 0;
    var SND_START = 0;
    var SND_END   = 0;

    fd = fs.openSync(FILENAME,"r");
    var stats = fs.fstatSync(fd);
    TOTAL_FILE_SIZE = stats.size;
    fs.closeSync(fd);
    
    socket = net.createConnection(RCV_PORT,RCV_HOST,function(err){
        fd = fs.createReadStream(FILENAME,{
            flags: 'r',
            encoding: null,
            fd: null,
            mode: 0o666,
            autoClose: true
        });

        fd.on('end', () => {
            console.log("DONE");
            SND_END = new Date().getTime();
            var delta = SND_END - SND_START;
            var Bps = (TOTAL_FILE_SIZE*1.0)/(delta/1000);
            console.log("SEND TIME:"+delta+"ms "+ Math.floor(Bps) +" B/s " +Math.floor(Bps/(1024*1024))+ " M/s "+Math.floor(Bps/(1024*1024*1024))+ " G/s");
            process.exit(0);
        });
        SND_START = new Date().getTime();
        fd.pipe(socket);
    });
}

function processControlPackets(sock,packet){
    if(packet.getType() == 0){
        //
    } else if(packet.getType() == 1){
        var jsdesc;
        try {
            jsdesc = JSON.parse(packet.getDetails());
        } catch(e){
            return;
        }
        filesend(jsdesc.port,jsdesc.host,jsdes.file);
    } else if(packet.getType() == 2){
        //
    }
}

function onConnEnd(){

}

function onConnErr(){

}

const Packet  = require("./packet");
const packetReader = new PacketReader(Packet,processControlPackets,onConnEnd,onConnErr);
//send on spawn
if(process.argv.length > 3){
    filesend(process.argv[2],process.argv[3],process.argv[4]);
}