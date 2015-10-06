
var packet = require("../common/packet");
var io = require("../node_modules/socket.io-client");
module.exports = function client(server,dataCallback){
  var socket = 0;
  var user = 0;
  var Packet = new packet();

  this.auth = function(_user,pass){
    user = _user;
    console.log(user+" authenticating at "+server);
    socket = io(server);
    socket.emit('auth',Packet.toBase64({user:user,password:pass}));
    socket.on(user,function(data){
      processData(data);
    })
  }

  this.send = function(data){
    try {
      socket.emit(user,Packet.toBase64(data));
    } catch( e ){
      console.log("Failed to send data",e);
      return false;
    }
    return true;
  }

  function processData(data){
    try {
      console.log("processing:");
      console.log(data);
      dataCallback(Packet.fromBase64(data));
    } catch( e ){
      console.log("Could not process incoming data",e);
    }
  }
}
