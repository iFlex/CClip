const Config = require("./Configurer.js");
const ChannelController = require("./ChanServer.js");

var channelDefs = Config.readChannelDefinitions();

ChannelController.configure({channels:channelDefs});
ChannelController.start();