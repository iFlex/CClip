module.exports = function packet(){
  this.fromBase64 = function(base64data){
      try {
        data = new Buffer(base64data, 'base64').toString('ascii');
        data = JSON.parse(data);
      } catch( e ) {
        console.log("PACKET: decoding packet",e);
      }
      return data;
  }

  this.toBase64 = function(data){
    var _data = null;
    try {
      _data = JSON.stringify(data);
      _data = new Buffer(_data).toString('base64');
    } catch( e ) {
      console.log("PACKET: could not encode packet",e);
    }
    return _data;
  }
}
