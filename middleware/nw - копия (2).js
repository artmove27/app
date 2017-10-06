var log = require("../libs/log.js")(module);
var randomstring = require("randomstring");

var string = randomstring.generate();
console.log("string",string);
//var StopBalance = require("../libs/bittrex.js");
var app ={};
//var io = app.get('io');
var socket = {};

function blab(room) {

    this.emit = function (data) {
        socket.emit(room, {hello: data});
    }
    this.on = function(f){
          socket.on(room, function (data) {
             // console.log(data);
               f(data)
           });
    }
}

var logmsg = new blab("news");

//
function errorMsg(data){
    //success: false, message: 'APIKEY_INVALID', result: null

    switch(data.message) {
    //
        case 'APIKEY_INVALID':
            logmsg.emit("Указаны не верные ключи");
          //  socket.disconnect(true);

            break;
    //
        case 10011:
            logmsg.emit("Ошибка установки ордера повтор через 15 секунд");

            break;
            //

        default:
            logmsg.emit("Ошибка не опрелена, сообщение администратору отправлено");
            break;
    }
}
// время
var moment = require('moment');

function estData(){
    var now = moment();
    return now.format('dddd, MMMM DD YYYY, h:mm:ss')
}

//
var io = {};

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
    this.run = function(soc){
        socket = soc;
        //io = soc;
      //  var lst = io.on('connection', function (sok) {
           // socket = sok;
            socket.on('disconnect', function () {
                // io.sockets.emit('user disconnected');
                log.info("User разорвал соединение");
                //  process.exit(-1);

                StopBalance.stop();
            });
             console.log(ob);
            // StopBalance.cfg(ob);
            StopBalance.start(ob);
       // });

        }



    //////

}

    var nullWallet = new startNopwes();



module.exports = nullWallet;

//

/**
 * Created by zews on 01.10.2017.
 */

var appB = require('../mod/b_conf.js');
//malyshev@ufm.admnsk.ru///
var CronJob = require('cron').CronJob;
var bittrex = require('node-bittrex-api');
//var bittrex = require('./node.bittrex.api.js');
/**
 bittrex.options({
    'apikey' : appB.key,
    'apisecret' : appB.sig
});


 **/


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
        if(err){
            errorMsg(err);
            log.error(err,"STOP-ERROR");
            StopBalance.stop();
        } else {
            var bl = data.result;
            var lbl = data.result.length - 1;
            var co = 0;
            // var kk = [];
            //  console.log(lbl);
            for (key in bl) {
                //   console.log( data.result[key].Currency, data.result[key].Balance );
                if (data.result[key].Currency != "BTC") {

                    walletInfo[key] = new Wallet();
                    walletInfo[key].set(data.result[key].Balance);
                    var cur = data.result[key].Currency;
                    var cu = {
                        "vp": cur,
                        "bln": data.result[key].Balance
                    };
                    if (data.result[key].Balance != 0) {
                        console.log(data.result[key].Currency, data.result[key].Balance);
                        logmsg.emit(data.result[key].Currency+", "+data.result[key].Balance);
                        vPrices(cu);
                    } else {
                        co++;
                        console.log(data.result[key].Currency, data.result[key].Balance, "кошелек пуст");
                        logmsg.emit(data.result[key].Currency+", "+ data.result[key].Balance+", "+ "кошелек пуст");
                        //  mesacoks(data);
                    }

                }
            }
            console.log(lbl,co);
            if (lbl == co) {
                StopBalance.stop();
                console.log("Stop");
                logmsg.emit("Выполнение задания завершено");
            }
            // console.log(kk);
//
        }
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
            //  console.log(vp.vp, "Кошелек пуст");
            //  rateOrder.Buy(data);
            // console.log("vPrices", appB.wallet[vp.vp]);
            return false;
        }
        if( vp.bln  >= limits ){

            //   console.log(walletInfo[vp].order.uuid);
            if(walletInfo[vp.vp].order.type != "sell") {
               // console.log("продаем все");
                logmsg.emit("продаем все");
                rateOrder.Sell(data);
            } else {
                console.log(vp.vp, "Есть установленный ордер", walletInfo[vp.vp].order.uuid, walletInfo[vp.vp].order.type);
                logmsg.emit(vp.vp + " Есть установленный ордер, "+ walletInfo[vp.vp].order.uuid+", " + walletInfo[vp.vp].order.type);
            }


        } else {
            //   console.log(walletInfo[vp].order.uuid);
            if(walletInfo[vp.vp].order.type != "buy") {
              //  console.log("покупаем лимит");
                logmsg.emit("покупаем лимит");
                rateOrder.Buy(data);
            } else {
                console.log(vp.vp, "Есть установленный ордер", walletInfo[vp.vp].order.uuid,  walletInfo[vp.vp].order.type);
                logmsg.emit(vp.vp + " Есть установленный ордер, "+ walletInfo[vp.vp].order.uuid+", " + walletInfo[vp.vp].order.type);
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
               log.error(err);
                errorMsg({"message":10011});
                //logmsg.emit("Ошибка установки ордера повтор через 15 секунд");
            } else {
                logmsg.emit("Установлен ордер " + dta.para+", " + limits +", "+ dta.result.Last+ ", " +data.result.uuid+", "+ "buy");
                log.info(dta.para, dta.limits ,dta.result.Last, data.result.uuid, "buy" );
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
                log.error(err);
                errorMsg({"message":10011});
               // logmsg.emit("Ошибка установки ордера повтор через 15 секунд");
            } else {
                logmsg.emit("Установлен ордер " + dta.para+", " + limits +", "+ dta.result.Last+ ", " +data.result.uuid+", "+ "sell");
                log.info(dta.para,limits,dta.result.Last, data.result.uuid, "sell" );
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





NW = new CronJob('*/15 * * * * *', function() {
        Balances();
   // console.log(estData())
    }, function () {
        /* This function is executed when the job stops */

    },
    false /* Start the job right now */
    //timeZone /* Time zone of this job. */
);

//console.log(NW.running);

function stoper(){
    this.start = function(ojc){
        if(ojc){
            bittrex.options({
                'apikey' : ojc.key,
                'apisecret' : ojc.sig
            });
           // console.log(estData());
          //  logmsg.emit("Запускаем");

        }
        logmsg.emit("Инициализация...");
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
    this.test = function(obj){
        console.log(obj);
    }
}
var StopBalance = new stoper();

