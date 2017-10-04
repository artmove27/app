var log = require("../libs/log.js")(module);
var StopBalance = require("../libs/bittrex.js");
var app ={};
//var io = app.get('io');
function startNopwes(){
  //    var app = dt;
  //   var io = req.app.get('io');
    var ob = {};
   this.info = function(obj){
       if(obj.key && obj.sig) {
           log.info("Данные от пользователя Users получены");
           ob = obj;
       } else {
           ob = obj;
           log.error("Данные от пользователя Users не получены");
           return 1000;
       }
   }
    this.run = function(){

       // console.log(ob);
       // StopBalance.cfg(ob);
        StopBalance.start(ob);

    }
}

    var nullWallet = new startNopwes();


//module.exports = startNopwes;
module.exports = nullWallet;