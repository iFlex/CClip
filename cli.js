const process = require("process");
const Packet = require("./channels/tcp/packet");

module.exports = new function(){
    var ChannelController;
    function processLine(line){
        line = line.split(" ");
        if(line[0] == "snd"){
            ChannelController.sendFile(line[1],line.splice(1));
        }
        if(line[0] == "rcv"){
            ChannelController.expectFile(line[1],line.splice(1));
        }
        if(line[0] == "test"){
            var a = new Packet();
            var b = new Packet();
            
            a.setType(1);
            a.setDetails(line[1]);
            b.digest(a.stringify());
            console.log(b.getType()+","+b.getLength()+",'"+b.getDetails()+"'");
        }
    }
    
    this.setChannelController = function(o){
        ChannelController = o;
    }

    this.run = function(){
        const readline = require('readline');        
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        function doAnswer(answer) {
            processLine(answer)
            rl.question(':', doAnswer);
        }
        rl.question(':', doAnswer);
    }
}()