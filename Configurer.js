module.exports = new function(){
    const fs = require("fs");
    var channelDefs = {};    
    
    // List all files in a directory in Node.js recursively in a synchronous fashion
    var findDefFiles = function(dir, defFiles) {
        files = fs.readdirSync(dir);
        defFiles = defFiles || [];
        
        files.forEach(function(file) {
          if (fs.statSync(dir + file).isDirectory()) {
            filelist = findDefFiles(dir + file + '/', defFiles);
          } else if (file.indexOf("channel.json") > -1){
            defFiles.push(dir);
          }
        });
    
        return defFiles;
      };
    
    function validateChannelDef(chandef){
        if(!chandef.name)
            throw new Exception("Missing channel name");
        if(!chandef.in)
            throw new Exception("Missing in member of channel def");
        if(!chandef.out)
            throw new Exception("Missing out member of channel def");
    }
    
    this.readChannelDefinitions = function(){
        defs = findDefFiles("./");
        for(var i in defs){
            var channelDef = require(defs[i]+"channel.json");
            try {
                channelDef.rootdir = defs[i];
                validateChannelDef(channelDef)
                channelDefs[channelDef.name] = channelDef;
            } catch(e) {
                console.log("Channel definition for:"+defs[i]+" is invalid."+e);
            }
        }
        return channelDefs;
    }
}();