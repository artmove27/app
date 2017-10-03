/**
 * Created by zews on 12.09.2017.
 * LOGS.JS
 */

var logfile = "log.txt";

//https://github.com/winstonjs/winston
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: logfile })
            ]
   // json: false
});


//logger.log('info', 'Hello distributed log files!');
//logger.info('Hello again distributed logs');
//logger.log('info', 'Test Log Message', { anything: 'This is metadata' });
/**
 * Created by zews on 12.09.2017.
 * SETUP.JS
 */

// https://www.npmjs.com/package/jsonfile


var jsonfile = require('jsonfile');
//var appfile = './data/setup.json';
//var app = jsonfile.readFileSync(appfile);
var app = require('./mod/conf.js');
logger.log(app.levellog, 'Start APP');

//console.log(app);
var strategyfile;
var param;
if (process.argv[2]) {
    param = process.argv[2];
    strategyfile = './data/strategy-'+param+'.json';

  //  process.exit(-1);
} else {
strategyfile = './data/strategy.json';
}

var strategy = jsonfile.readFileSync(strategyfile);

logger.log(app.levellog, 'strategy '+ strategy.name);
if(strategy.power == false){
    logger.log(app.levellog, 'Stop APP, strategyOFF '+ strategy.name);
    process.exit(-1);
}


/**
 * Created by zews on 12.09.2017.
 */
//ANALITIC.JS


function analizator (){
    this.max = function(data){
       //
        var maxP = Math.max.apply( Math, data );
          logger.log(app.levellog,'analiTic ' + " MAX " + maxP);
            return maxP ;
    }
    this.min = function(data){
         var minP = Math.min.apply( Math, data );
         logger.log(app.levellog,'analiTic ' + " MIN " + minP);
        return minP ;
    }
    this.vektor = 0;
    this.priceOrder =function(price){
        var profits = price.asks / price.bids;
        var PROF = (price.asks - price.bids); // * strategy.lot;
        var PROf = Number(PROF).toPrecision(5);
        console.log("Profit " +  PROf);
        if(profits < strategy.profit ){
            logger.log(app.levellog, 'analizator '+ 'profit < minimum /' , profits );
               return false;
        } else {
            logger.log(app.levellog, 'analizator profit '+ profits);
            return true;
        }
    }
}

var analiTic = new analizator();


/**
 * Created by zews on 12.09.2017.
 */

//https://github.com/kwiksand/yobit/blob/master/index.js
//Yobit = require('yobit');
Yobit = require('./mod/yobit.js');

// Test public data APIs
var publicClient = new Yobit();
var privateClient = new Yobit(app.key, app.sig);

function tikersBarja(f){
    logger.log(app.levellog,'get ticker '+ strategy.v_para);
// // get BTCUSD ticker
publicClient.getOrderBook(function(err,data){
  var vpara = strategy.v_para;
  var OrderPrice = {};

    var array = data[vpara].asks;
    var a;
    var arASKS =[];
    //
    for (var i = 0; i < array.length; i++) {
        a = array[i];
        arASKS[i] = a[0];
    };

     //  console.log("asks");
    OrderPrice.asks = analiTic.min(arASKS);

    //
    var arBIDS =[];
    array = data[vpara].bids;
    for (var i = 0; i < array.length; i++) {
        a = array[i];
        arBIDS[i] = a[0];
    };

 //   console.log("bids");
   // console.log(arBIDS);
    OrderPrice.bids = analiTic.max(arBIDS);

  //  console.log(OrderPrice);

    f(OrderPrice);
        return true}, strategy.v_para, strategy.OrderBookLimit);

}

function sleep(millis) {
    var t = (new Date()).getTime();
    var i = 0;
    while (((new Date()).getTime() - t) < millis) {
        i++;
    }
}

function OrdersInfo(f,id){
    privateClient.getMyOrderInfo(function(err,data){

        if (data.error) {
            logger.log('error', 'OrdersInfo', data);
            return false;
        }

        if(data.return[id].type == "buy"){
            var TT = "Buy";
        } else {
            var TT = "Sell";
        }
      //  console.log(data.return[id].status, TT);
        var status = data.return[id].status;
          if(status == 1 || status == 2 ){
              //
              OrderControl[TT].set(false);
              console.log(status, TT, "OrdersInfo");
              return false;
          }
        console.log(data);
       sleep(3000);
            if (f) {
                data.ID = id;
                f(data);
            }




    },id)
}
function ActiveOrders() {

    privateClient.getActiveOrders(function (err, data) {
       // console.log(data);
        if (err) {
            logger.log('error', 'ActiveOrders', data);
        } else {
            logger.log('info', 'ActiveOrders Start');
        }
    //  console.log(data);
        var d = data;
      var orders_id = d.return;
        var coun = 0;
         if(orders_id) {
        for(key in orders_id){
            coun++
            logger.log('info',"ID Order "+key," Price "+orders_id[key].type+" "+orders_id[key].rate);
                  // Orders.Cancel(key);

            if(orders_id[key].type == "buy"){
                OrderControl.Buy.set(key);
           //    setTimeout(function(){
             //      Orders.Cancel(key);
              //     Orders.ReinstallOrderB(key)
             //  },700)

            }

            if(orders_id[key].type == "sell"){

             OrderControl.Sell.set(key);
         //           setTimeout(function(){
               //     Orders.Cancel(key);
             //   },1100)
            }

              }
          //   console.log("KEY", key);
             if(coun == 2){
                 setTimeout(function(){
                        Orders.Cancel(OrderControl.Buy.get());
                     //     Orders.ReinstallOrderB(key)
                 },700);

                 setTimeout(function(){
                         Orders.Cancel(OrderControl.Sell.get());
                 },1100)

             } else {
                 var tope = orders_id[key].type;
                 console.log("TYPE", tope);
                 if(orders_id[key].type == "buy"){
                     setTimeout(function(){
                         // Orders.Cancel(key);
                         Orders.ReinstallOrderB(key);
                     },900);
                 } else {
                     setTimeout(function(){
                     //
                     Orders.Cancel(key);
                     },900);
                 }


             }

          //  jobCron.OrdersContrl.start();

              //

        }  else {
           // console.log("NO Orders");
            logger.log('info', 'ActiveOrders NO Orders');
            jobCron.ActiveOrders.stop();
          //  jobCron.ordersDubl.start();
        }


    }, strategy.v_para);

}

/**

// get BTCUSD trades
publicClient.getTrades(function(err,data){
    console.log(data)
    return true}, strategy.v_para, 2)



// get Account Balance
privateClient.getInfo(function(err,data){
    console.log(data);
    return true}, {})

 **/
function Ticers24(f){

publicClient.getTicker(function(err,data){
    if (data.error) {
        logger.log('error', 'Ticers24', data);
        //   console.log(data);
    } else {
        logger.log('info', 'Ticers24 Start');
        if(f){
            f(data)
        }
    }

    return true}, strategy.v_para);
}

function Ticersorder(f){

    publicClient.getTicker(function(err,data){
        if (err) {
            logger.log('error', 'Ticersorder', data);
         //  console.log(err);
        } else {
            logger.log('info', 'Ticersorder Start');
            if(f){
                var OrderPrice = {};
               OrderPrice.asks =data[strategy.v_para].sell;
                OrderPrice.bids =data[strategy.v_para].buy;
                f(OrderPrice)
            }
        }

        return true}, strategy.v_para);
}


//


function ActivOrdersInfo(){
    console.log("Buy",OrderControl.Buy.get(),"Sell",OrderControl.Sell.get());
    if(OrderControl.Buy.get() == false && OrderControl.Sell.get() == false){
        // jobCron.ActiveOrders.stop();
        jobCron.OrdersContrl.stop();
    }

    if(OrderControl.Buy.get()){
      //  console.log("Buy",OrderControl.Buy.get());
        OrdersInfo(Orders.ReinstallOrder,OrderControl.Buy.get());
    }

    if(OrderControl.Sell.get()){
     //   console.log("Sell",OrderControl.Sell.get());
        setTimeout(function(){
            OrdersInfo(Orders.ReinstallOrder,OrderControl.Sell.get());

        },3000);

    }

}


//var reinstallOrder = Ticersorder();
/**
 * Created by zews on 12.09.2017.
 */

var orderfile = './data/order-'+strategy.name+'.json';
var OrderIfo ={};

function saveOeder (type, data){
    //  console.log(data);
    OrderIfo[type] = [data.return.order_id, data.price];
      jsonfile.writeFile(orderfile, OrderIfo, function (err) {
        console.error(err)
    })
}

function OrderSave(){
    var ID = false;
    this.get = function(){
        return ID;
    }
    this.set = function(id){
        ID = id;
    }
}
var OrderControl = {};
OrderControl.Buy = new OrderSave();
OrderControl.Sell = new OrderSave();

function CoStep(){
    var count = 0;
    this.get = function(){
        return count;

    }
    this.plus = function(){
        count++;
    }
    this.set = function(){
        count = 0
    }
}

var StepCo = new CoStep();
var CounTest = new CoStep();
function OrderTorg(){
    //
    var self = this;
    //
    this.ReinstallOrderB = function(d){
        privateClient.CancelOrder(function(err,data){
            if (err) {
                logger.log('error', 'ReinstallOrder-Cancel '+ d);
                //   console.log(data);
            } else {
                logger.log('info', 'ReinstallOrder-Cancel '+ d);
                console.log(d,"ReinstallOrder" );
                Ticersorder(self.Buy);
            }
        },d)
    };

//
    this.ReinstallOrder = function(d){
        privateClient.CancelOrder(function(err,data){
            if (err) {
                logger.log('error', 'ReinstallOrder-Cancel '+ d.ID, data);
                //   console.log(data);
            } else {
                logger.log('info', 'ReinstallOrder-Cancel '+ d.ID, data);
                console.log(d,"ReinstallOrder" );
                //Ticersorder()
            }
        },d.ID)
    };
    //
    this.Cancel = function(id){
        privateClient.CancelOrder(function(err,data){
            if (data.error) {
                logger.log('error', 'OrderTorg-Cancel '+ id, data);
                //   console.log(data);
            } else {
                logger.log('info', 'OrderTorg-Cancel '+ id, data);

            }
        },id)
    }
 //
    this.Buy = function(price) {
        privateClient.addTrades(function (err, data) {
            if (data.error) {
                logger.log('error', 'OrderTorg-Buy', data);
                //   console.log(data);
            } else {
                logger.log('info', 'OrderTorg-Buy', data);
            }
        }, strategy.v_para, "buy",  strategy.lot, price.bids)

    }
        //

    this.Sell = function(price) {
        privateClient.addTrades(function (err, data) {
            if (data.error) {
                logger.log('error', 'OrderTorg-Sell', data);
                //   console.log(data);
            } else {
                logger.log('info', 'OrderTorg-Sell', data);
            }
        }, strategy.v_para, "sell", strategy.lot, price.asks);

    }
    //
    this.Dubl = function(price) {
        jobCron.ordersDubl.stop(); //!
        logger.log(app.levellog, 'OrderTorg-Dubl', price);

                     privateClient.addTrades(function (err, data) {
                         logger.log(app.levellog, 'OrderTorg-Dubl-Buy', price.bids);
                         if (data.error) {
                             logger.log('error', 'OrderTorg-Dubl-Buy', data);
                             //   console.log(data);
                         } else {
                             logger.log(app.levellog, 'OrderTorg-Dubl-Buy', data);

                             data.price = price.bids;
                             saveOeder("Buy",data);
                             OrderControl.Buy.set(data.return.order_id);
                             //---------------------------------
                             privateClient.addTrades(function (err, data) {
                                 logger.log(app.levellog, 'OrderTorg-Dubl-Sell', price.asks);
                                 if (data.error) {
                                     logger.log('error', 'OrderTorg-Dubl-Sell', data);
                                     self.Sell(price);
                                              } else {
                                     logger.log(app.levellog, 'OrderTorg-Dubl-Sell', data);
                                     data.price = price.asks;
                                     saveOeder("Sell",data);
                                     OrderControl.Sell.set(data.return.order_id);
                             //---------------------------------

                                 }
                             }, strategy.v_para, "sell", strategy.lot, price.asks);

                             //----
                         }
                     }, strategy.v_para, "buy",  strategy.lot, price.bids);
                     //
      //  jobCron.ActiveOrders.start();
    }
}


var Orders = new OrderTorg();
//Orders.Cancel(140001246917365);
function ostart(OrderPrice){
    var OrderStart = analiTic.priceOrder(OrderPrice);
    if(OrderStart){

        //Orders.Dubl(ActiveOrderstart, OrderPrice);
        //  Orders.Dubl(null, OrderPrice);
        Orders.Dubl(OrderPrice);


    } else {
        console.log(OrderPrice);
    }
}

function ordCtr(data){

}
/**
 * Created by zews on 13.09.2017.
 */
//CRON.JS

var CronJob = require('cron').CronJob;

var jobCron = {};

jobCron.ordersDubl = new CronJob(strategy.period, function() {
 // tikersBarja(ostart);
        Ticersorder(ostart);
       // Ticers24();
      }, function () {
        /* This function is executed when the job stops */
    jobCron.ActiveOrders.start();
       // jobCron.OrdersContrl.start();
    },
    false /* Start the job right now */
    //timeZone /* Time zone of this job. */
);


//jobCron.ActiveOrders = new CronJob(strategy.period, function() {
jobCron.ActiveOrders = new CronJob('10 */1 * * * *', function() {
     ActiveOrders();
    //  ActiveOrders(OrdersInfo);
     //   ActivOrdersInfo();
      Ticers24(ftest);
          }, function () {
        /* This function is executed when the job stops */
        jobCron.ordersDubl.start();
    },
    false /* Start the job right now */
    //timeZone /* Time zone of this job. */
);

jobCron.OrdersContrl = new CronJob('0 */1 * * * *', function() {
        ActivOrdersInfo();
    }, function () {
        /* This function is executed when the job stops */
        jobCron.ordersDubl.start();
    },
    false /* Start the job right now */
    //timeZone /* Time zone of this job. */
);


ActiveOrderstart = jobCron.ActiveOrders.start;