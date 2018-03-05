const Config = require("./Configurer.js");
const ChannelController = require("./ChanServer.js");
const cli = require("./cli");

var channelDefs = Config.readChannelDefinitions();

ChannelController.configure({port:8081,channels:channelDefs});
ChannelController.start();

cli.setChannelController(ChannelController);
cli.run();