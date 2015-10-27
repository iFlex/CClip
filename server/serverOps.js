module.exports = function(shared){
  for( k in shared )
    this[k] = shared[k];

  //bridge making
  this.handleServerRequest = function(socket,data){
    if(data.request === "bridge" ){
      console.log("Handling bridge request");
      switch(data.action){
        case "open":this.requestBridge(socket,data);break;
        case "accept":this.acceptBridge(socket,data);break;
        case "close":this.closeBridge(scoket,data);break;
        case "decline":this.declinbeBridge(socket,data);break;
        default: console.log("Unknown bridge operation:"+data.action);
      }
    }
  }

  this.requestBridge = function(socket,data){
    var d = {s:this.socketToUser[socket],t:"request",request:"bridge",action:"request",user:data.r}

    if(this.userBridge[d.s] && this.userBridge[d.s][data.r] && this.userBridge[data.r] && this.userBridge[data.r][d.s])
      return 1;//bridge already exists
    if(this.activeUsers[data.r]) {
      this.userBridge[d.s] = 0;
      this.userBridge[data.r] = 0;
      this.sender.sync(data,data.r);
      console.log(d.s+" bridge request > "+data.r);
      return 1;
    }
    return 0;
  }

  this.declibeBridge = function(socket,data){
    var d = {s:this.socketToUser[socket],t:"request",request:"bridge",action:"decline",user:data.s}

  }

  this.acceptBridge = function(socket,data){
    var d = {s:this.socketToUser[socket],t:"request",request:"bridge",action:"accept"}
    this.userBridge[d.s] = data.r;
    this.userBridge[data.r] = d.s;
    this.sender.sync(data,data.r);
    console.log(d.s+" accepted bridge > "+data.r);
  }

  this.closeBridge = function(socket,data){
    var d = {s:this.socketToUser[socket],t:"request",request:"bridge",action:"clise"}
    this.userBridge[d.s] = 0;
    this.userBridge[data.r] = 0;
    this.sender.sync(data,data.r);
    console.log(d.s+" closed bridge > "+data.r);
  }
};
