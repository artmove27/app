/**
 * Created by zews on 24.09.2017.
 */

var jsonfile = require('jsonfile');
var file = './data/bittrex_conf.json';
var app = jsonfile.readFileSync(file);

//console.log(app);
module.exports = app;