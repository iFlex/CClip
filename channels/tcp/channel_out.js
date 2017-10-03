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

console.log(process.argv);
//load  - parameters
const RCV_HOST = process.argv[3];
const RCV_PORT = process.argv[4];
const FILENAME = process.argv[5];
const CHUNK_SIZE = 1400;
var socket;
var fd;

const MGT_PORT = process.argv[2];
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

//stats - 
var READ = 0;
var SENT = 0;
var READ_ATTEMPT = 0;
var SEND_ATTEMPT = 0;
var RAM_QUEUE_SIZE = 1024*1024*800;
var TOTAL_FILE_SIZE = 0;
var SND_START = 0;
var SND_END   = 0;


function initiate(){
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

initiate();