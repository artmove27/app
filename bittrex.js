/**
 * Created by zews on 24.09.2017.
 */

var appB = require('./mod/b_conf.js');
//malyshev@ufm.admnsk.ru///
var CronJob = require('cron').CronJob;
var bittrex = require('node-bittrex-api');
//var bittrex = require('./node.bittrex.api.js');
var async = require('async');
bittrex.options({
    'apikey' : appB.key,
    'apisecret' : appB.sig
});


//var walletInfo = require("./mod/b_wallet.js");

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
var wl = appB.wallet;
for(key in wl){
    walletInfo[key] = new Wallet();
    //  walletInfo[key].limit = wl[key];

}



function Balances() {
    bittrex.getbalances( function( data, err ) {

        var bl = data.result;
        var lbl = data.result.length - 1;
        var co =-1;
       // var kk = [];
      //  console.log(lbl);
        for(key in bl){
         //   console.log( data.result[key].Currency, data.result[key].Balance );
            if(key != "BTC"){
                co++;
                walletInfo[key] = new Wallet();
                walletInfo[key].set(data.result[key].Balance);
                 var cur = data.result[key].Currency;
                var cu = {
                    "vp": cur,
                    "bln": data.result[key].Balance
                };
                vPrices(cu);

                      }
            }
            if(lbl == co){
                StopBalance.stop();
                console.log("Stop");
            }
       // console.log(kk);

    });
}


function vPrices(vp){

    if(vp.vp == "BTC"){
        return false;
    }

    var para = appB.wallet[vp.vp];
    bittrex.getticker( { market : para }, function( data, err ) {

        data.para = para;
        data.vp = vp.vp;
        data.bln = vp.bln;
        var limits = walletInfo[vp.vp].lmt(data.result.Last, appB.BTC_Limit);
        data.limits = limits;

        if( vp.bln == 0 ){
            console.log(vp.vp, "Кошелек пуст");
          //  rateOrder.Buy(data);
           // console.log("vPrices", appB.wallet[vp.vp]);
            return false;
        }
        if( vp.bln  >= limits ){

            //   console.log(walletInfo[vp].order.uuid);
            if(walletInfo[vp.vp].order.type != "sell") {
                console.log("продаем все");
                rateOrder.Sell(data);
            } else {
                console.log(vp.vp, "Есть установленный ордер", walletInfo[vp.vp].order.uuid, walletInfo[vp.vp].order.type);
            }


        } else {
            //   console.log(walletInfo[vp].order.uuid);
            if(walletInfo[vp.vp].order.type != "buy") {
                console.log("покупаем лимит");
                rateOrder.Buy(data);
            } else {
                console.log(vp.vp, "Есть установленный ордер", walletInfo[vp.vp].order.uuid,  walletInfo[vp.vp].order.type);
            }

        }

    });

}
function Orders(){
    this.Buy = function(dta){
        //
      //  var limits = walletInfo[dta.vp].lmt(dta.result.Last, appB.BTC_Limit);

            bittrex.buylimit({ market : dta.para, quantity: dta.limits , rate: dta.result.Last }, function( data, err ) {
                var limits = walletInfo[dta.vp].lmt(dta.result.Last, appB.BTC_Limit);
                if(err){
                    console.log(err);
                } else {
                   console.log(dta.para, dta.limits ,dta.result.Last, data.result.uuid, "buy" );
                    walletInfo[dta.vp].order.uuid = data.result.uuid;
                    walletInfo[dta.vp].order.type = "buy";
                }

            });

        //


    }
    //
    this.Sell = function(dta){
        //
    bittrex.selllimit({ market : dta.para, quantity: dta.bln, rate: dta.result.Last }, function( data, err ) {
        var limits = walletInfo[dta.vp].lmt(dta.result.Last, appB.BTC_Limit);
        if(err){
            console.log(err);
        } else {
            console.log(dta.para,limits,dta.result.Last, data.result.uuid, "sell" );
            walletInfo[dta.vp].order.uuid = data.result.uuid;
            walletInfo[dta.vp].order.type = "sell";
        }
        });

    }
}

rateOrder = new Orders();
function count(){
    var count =0;
    var countMax = appB.Currency_country;
    this.plus = function(){
        count++

    }
    this.get = function(){
        return count;
    }
    this.reset = function(){
        count =0;
    }
    this.maxGet = function(){
        return countMax;
    }

}
var counres = new count();





NW = new CronJob('*/10 * * * * *', function() {
        Balances();
    }, function () {
        /* This function is executed when the job stops */

    },
    true /* Start the job right now */
    //timeZone /* Time zone of this job. */
);

//console.log(NW.running);

function stoper(){
    this.start = function(){
        if(!NW.running){
            NW.start();
        }
    }
    //
    this.stop = function(){
        if(NW.running){
            NW.stop();
        }
    }
}
var StopBalance = new stoper();

//Balances();