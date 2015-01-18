var fs = require("fs");
var data = "0cacacacaca";
fs.writeFile("cgarici", data.substr(0,data.length), function(err) { if(err) console.log("("+"caca"+"):FILE_WRITE_ERROR:"+err); console.log("complete!");});