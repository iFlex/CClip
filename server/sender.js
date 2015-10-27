module.exports = function(shared){
  for( k in shared )
    this[k] = shared[k];

  this.sync = function(data,user,exclude,nopack){
    if(!nopack)
      data = this.Packet.toRaw(data);//repackage data

    var destinations = this.activeUsers[user];
    for( k in destinations )
       if( destinations[k][0] !== exclude)
           destinations[k][0].emit(user,data);
  }
  this.route = function(data,user){
    for( recipient in data.r ) {// for each user in the recipient list
      if(userBridge[user][recipient]) {//if sender is allowed to talk to recipient
        this.sync(data,recipient);
      }
    }
  }
}
