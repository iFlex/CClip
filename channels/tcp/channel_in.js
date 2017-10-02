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

//load  - parameters
const MGT_PORT = process.argv[2];
const SND_HOST = process.argv[3];
const SND_PORT = process.argv[4];
const CHUNK_SIZE = 1400;
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
/*
var fd;
index = 0;
const server = net.createServer((c) => {
    console.log('client connected');
    index++;
    fd = fs.createWriteStream(index+"out.tst", {flags: 'w',
        encoding: 'binary',
        fd: null,
        mode: 0o666,
        autoClose: true});
    c.pipe(fd);
});

server.on('error', (err) => {
    throw err;
});

server.listen(8124, () => {
    console.log('server bound');
});
*/