//t = type, d = data, i = current index, l = last index, s = sender, sid = stream id
//type - clipboard,strea,continuous_stream
module.exports = new (function(){
  var lastClipboard = 0;
  var streams = {};
  var fs = require("fs");

  this.onNewPacket = function(data){
    console.log("Processing");
    console.log(data);
    if(data.t === "clipboard"){
      lastClipboard = data.d;
    } else if( data.t === "stream"){
      handleStream(data);
    }
  }

  //stream handling
  function initiateStream(data){
    var usr = data.s || 0;
    streams[usr] = streams[usr] || {};
    var streamInfo = { lastIndex:-1, file:0, buffer:{}, buffered:0, maxBuffer:10 };
    streamInfo.file = fs.openSync(data.filename,"w");
    streams[usr][data.sid] = streamInfo;

    midStream(data);
  }

  function midStream(data){
    var usr = data.s || 0;
    var streamInfo = streams[usr][data.sid];
    if( data.i > streamInfo.lastIndex + 1 ) {//ahead of time packet, buffer it
      if(streamInfo.buffered < streamInfo.maxBuffer) {
        streamInfo.buffer[ data.i ] = data;
        streamInfo.buffered++;
      } else {
        //todo: ask for resend
      }
    } else {
      var buffer = new Buffer(data.d,"binary");
      fs.write(streamInfo.file,buffer,0,buffer.length);
      streamInfo.lastIndex = data.i;
      var rawData = 0;
      //write out the buffered bits if necessary
      while(streamInfo.buffer[data.i+1]){
        rawData = streamInfo.buffer[data.i+1].d;

        fs.write(streamInfo.file,rawData,0,length(rawData));

        streamInfo.lastIndex = data.i+1;
        delete streamInfo.buffer[data.i];
        streamInfo.buffered--;
      }
    }
  }

  function closeStream(data){
    midStream(data);
    var usr = data.s || 0;
    var streamInfo = streams[usr][data.sid];
    fs.close(streamInfo.file);
    delete streams[usr][data.sid];
  }

  function handleStream(data){
    if(data.i == 0)
      initiateStream(data);
    else if( data.i < data.l )
      midStream(data);
    else
      closeStream(data);
  }
})();
