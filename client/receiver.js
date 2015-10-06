//t = type, d = data, i = current index, l = last index, s = sender, sid = stream id
//type - clipboard,strea,continuous_stream
module.exports = new (function(){
  var lastClipboard = 0;
  var streams = {};
  var fs = require("fs");
  var active = true;

  this.getLastClipboard = function(){
    return lastClipboard;
  }

  this.onNewPacket = function(data){
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
    streamInfo.file = fs.createWriteStream(data.filename);//fs.openSync(data.filename,"w");
    streamInfo.ready = false;
    streamInfo.file.on("open",function(){
      streamInfo.ready = true;
      midStream(data);
    })
    streams[usr][data.sid] = streamInfo;
  }

  function commitBuffer(streamInfo){
    while(streamInfo.buffer[streamInfo.lastIndex+1]){
      streamInfo.file.write(new Buffer(streamInfo.buffer[streamInfo.lastIndex+1].d, 'base64'));
      streamInfo.lastIndex++;
      delete streamInfo.buffer[streamInfo.lastIndex];
      streamInfo.buffered--;
    }
  }
  function midStream(data){
    if(!active)
      return;

    var usr = data.s || 0;
    var streamInfo = streams[usr][data.sid];
    if( data.i > streamInfo.lastIndex + 1 || !streamInfo.ready ) {//ahead of time packet, buffer it
      if(streamInfo.buffered < streamInfo.maxBuffer) {
        streamInfo.buffer[ data.i ] = data;
        streamInfo.buffered++;
      } else {
        //todo: ask for resend
        console.log("FATAL STREAM ERROR, COULD NOT ORDER PACKETS");
      }
    } else {
      streamInfo.file.write(new Buffer(data.d, 'base64'));
      streamInfo.lastIndex = data.i;
      commitBuffer(streamInfo);
    }
  }

  function closeStream(data){
    midStream(data);
    var usr = data.s || 0;
    var streamInfo = streams[usr][data.sid];
    streamInfo.file.close();
    delete streams[usr][data.sid];
  }

  function handleStream(data){
    if(!active)
      return;

    if(data.i == 0)
      initiateStream(data);
    else if( data.i < data.l )
      midStream(data);
    else
      closeStream(data);
  }
})();
