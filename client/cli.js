module.exports = new (function(){
  var commands = {};
  this.run = function(_commands){
    for( k in _commands )
      commands[k] = _commands[k];

    process.stdout.write(">");
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', function() {
      var chunk = process.stdin.read();
      if (chunk !== null && chunk != "help")
        processCommand(chunk);
      else
        listCommands();
      process.stdout.write(">");
    });
  }

  function processCommand(command){
    command = command.substr(0,command.indexOf("\n"));
    command = command.split(" ");
    cmd = command[0];
    command = command.splice(1,command.length);
    try {
      commands[cmd].apply(this,command);
    } catch ( e ) {
      console.log("Error, can't execute command "+cmd+":",e);
    }
  }

  function listCommands(){
    process.stdout.write("available commands:");
    for( k in commands)
      process.stdout.write(k+'\n');
  }
})();
