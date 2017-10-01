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
const RCV_HOST = process.argv[2];
const RCV_PORT = process.argv[3];
const FILENAME = process.argv[4];
const CHUNK_SIZE = 1400;
var socket;
var fd;

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
        //sendEntireFile();
    });
}
/*
function sendChunk(err,bytesRead,buffer){
    if(bytesRead == 0)
        return;
    
    READ++;
    SEND_ATTEMPT++;
    var queued = false; 

    function onComplete(){
        SENT++;
        if(SENT == READ && TOTAL_FILE_SIZE <= READ*CHUNK_SIZE){
            socket.end();
            SND_END = new Date().getTime();
            var delta = SND_END - SND_START;
            var Bps = (READ*CHUNK_SIZE*1.0)/(delta/1000);
            process.exit(0);
        }
    }

    if(bytesRead < buffer.length){
        var buffer2 = new Buffer(bytesRead);
        buffer.copy(buffer2,0,0,bytesRead);
        queued = socket.write(buffer2,"binary",onComplete);
    } else {
        queued = socket.write(buffer,"binary",onComplete);
    }
    
    if(!queued){
        //need to slow down sending rate
    } else {
        //can speed up sending rate again
    }
}

function readFromFile(fpos) {
    var buffer = new Buffer(CHUNK_SIZE);
    fs.read(fd,buffer,0,CHUNK_SIZE,fpos,sendChunkSND_START = new Date().getTime(););
    READ_ATTEMPT++;
}

function sendEntireFile() {
    var index = 0;
    SND_START = new Date().getTime();
    while(index < TOTAL_FILE_SIZE){
        //if(){
        readFromFile(index);
        index += CHUNK_SIZE;
        //}
    }
    console.log(READ_ATTEMPT+"!"+READ+"!"+SEND_ATTEMPT+"!"+SENT);
}
*/
initiate();