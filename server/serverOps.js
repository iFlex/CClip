module.exports = function(shared){
  for( k in shared )
    this[k] = shared[k];

  //bridge making
  this.handleServerRequest = function(socket,data){

  }
  this.requestBridge = function(socket,data){

  }
  this.declibeBridge = function(socket,data){

  }
  this.acceptBridge = function(socket,data){

  }
  this.closeBridge = function(socket,data){

  }
  
  //friend requests
  //TODO
};
