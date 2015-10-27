/*
t = type,
d = data,
i = current index,
l = last index,
s = sender,
r = receiver,
sid = stream id
*/
//type - clipboard,strea,continuous_stream
module.exports = function(client){
  var fs = require("fs");

  var streams = {};
  var streamID = 0;
  var readLength = 1024;
  var active = true;

  this.send = function(data){
    console.log(data);
    client.send(data);
  }

  this.sendRawData = function(data){
    var data = {
      t:"clipboard",
      d:data
    }
    client.send(data);
  }

  this.sendFile = function(path){
    var streamInfo = {lastSent:0,lastAck:0,index:0,file:0};
    try {
      streamInfo.file = fs.openSync(path,'r');
      var stats = fs.statSync(path)
      streamInfo.totalSegments = Math.ceil(stats["size"] / readLength);
      streamInfo.filename = path;
      initStream(streamInfo);
    } catch ( e ){
      console.error("Could not open file:"+path,e);
      return 0;
    }
    return 1;
  }

  this.start = function(){
    active = true;
  }
  this.stop = function(){
    active = false;
  }

  //stream handling
  function initStream(streamInfo){
    streamInfo.sid = streamID;
    streamInfo.buffer = new Buffer(readLength);
    streams[streamID] = streamInfo;
    continueStream(streamID);
    streamID++;
  }
  function endStream(id){
    delete streams[id];
  }

  function continueStream(id){
    if(active)
    {
      var stream = streams[id];
      fs.read(stream.file, stream.buffer, 0, stream.buffer.length, stream.index, function(err, bytes){
        if (err) {
          stream.error = err;
          endStream(id);
        }
        else {

          var data = {
            t:"stream",
            sid:id,
            i:Math.ceil(stream.index/readLength),
            l:stream.totalSegments,
            d:stream.buffer.slice(0,bytes).toString('base64')
          }
          if(data.i == 0)
            data.filename = "_"+stream.filename;

          client.send(data);
          stream.index += bytes;
          if( bytes > 0 ){
            continueStream(id);
          } else {
            endStream(id);
          }
        }
      });
    }
  }
}
