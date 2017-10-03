/**
 * Created by zews on 24.09.2017.
 */

var app = require('./b_conf.js');
function Wallet(){
    var balance =0;
    this.get = function(){
        return balance;
    }
    this.set = function(data){
        balance = data;
    }
   this.order = {"uuid":false,
                  "type":false};
    this.lmt = function(p,BTC_Limit){
        var lmt = BTC_Limit / p;
        return lmt;
    }

}

var walletInfo={};
var wl = app.wallet;
for(key in wl){
    walletInfo[key] = new Wallet();
  //  walletInfo[key].limit = wl[key];

}

module.exports = walletInfo;