/**
 * Created by zews on 15.09.2017.
 */
// https://www.npmjs.com/package/jsonfile


var jsonfile = require('jsonfile');
var appfile = './data/conf.json';
var app = jsonfile.readFileSync(appfile);

//console.log(app);
module.exports = app;