
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
    socket.emit('auth',Packet.toRaw({user:user,password:pass}));
    socket.on(user,function(data){
      processData(data);
    });
  }

  this.send = function(data){
    try {
      //console.log("Sending");
      //console.log(data);
      socket.emit(user,Packet.toRaw(data));
    } catch( e ){
      console.log("Failed to send data",e);
      return false;
    }
    return true;
  }

  function processData(data){
    try {
      dataCallback(Packet.fromRaw(data));
    } catch( e ){
      console.log("Could not process incoming data",e);
    }
  }
}
