const process = require("process");

module.exports = new function(){
    var ChannelController;
    function processLine(line){
        console.log(">>"+line);
        line = line.split(" ");
        if(line[0] == "snd"){
            ChannelController.sendFile(line[0],line.splice(1));
        }
    }
    
    this.setChannelController = function(o){
        ChannelController = o;
    }

    this.run = function(){
        process.stdin.on('data', function(chunk) {
            lines = chunk.split("\n");
        
            lines.foreach(processLine);
        });
    }
}()