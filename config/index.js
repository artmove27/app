/**
 * Created by zews on 29.09.2017.
 */
//https://github.com/indexzero/nconf
var nconf = require("nconf");
var path =  require("path");
//var fs = require("fs");

nconf.argv()
    .env()
    .file({ file: path.join(__dirname,'config.json' )});

module.exports = nconf;