module.exports = function packet(){
  this.fromRaw = function(data){
      try {
        //data = new Buffer(base64data, 'base64').toString('binary');
        data = JSON.parse(data);
      } catch( e ) {
        console.log("PACKET: decoding packet",e);
      }
      return data;
  }

  this.toRaw = function(data){
    var _data = null;
    try {
      _data = JSON.stringify(data);
      //_data = new Buffer(_data).toString('base64');
    } catch( e ) {
      console.log("PACKET: could not encode packet",e);
    }
    return _data;
  }
}
