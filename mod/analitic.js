/**
 * Created by zews on 15.09.2017.
 */

// https://momentjs.com/
var moment = require('moment');
var now = moment();
//console.log(now.format('dddd, MMMM DD YYYY'));

//https://github.com/louischatriot/nedb
var Datastore = require('nedb');
var CronJob = require('cron').CronJob;
db = {};

Yobit = require('./yobit.js');
var publicClient = new Yobit();

var jsonfile = require('jsonfile');
if (process.argv[2]) {
    var file = process.argv[2] + ".json";
    strategyfile = './data/'+file;

   var strategy = jsonfile.readFileSync(strategyfile);

} else {
    console.log("Не указан файл стратегии");
    process.exit(-1);
}

db[strategy.v_para] = new Datastore('./datadb/'+strategy.v_para+'.db');
db[strategy.v_para].loadDatabase();
//записываем в базу
function saveDB (data){
        db[strategy.v_para].insert(data,function (err, numReplaced) {
        // numReplaced = 1
        // The doc #3 has been replaced by { _id: 'id3', planet: 'Pluton' }
        // Note that the _id is kept unchanged, and the document has been replaced
        // (the 'system' and inhabited fields are not here anymore)
          //  console.log(data);
            if(err) {
                console.log(err);
            } else {
                console.log(numReplaced);
            }
    });

}
//выводим статистику из базы
function Viewer(){

    if(!process.argv[4]){
        var co = strategy.profit;
    } else {
        var co = process.argv[4];
        co = co*1;
     //   console.log(co);
    }

    if(!process.argv[5]){
        var dd = now.format('DD-MM-YYYY');
    } else {
        var dd = process.argv[5];
    }
    db[strategy.v_para].find({DD : dd ,profit:{$gte: co}}, function (err, docs) {
        // docs contains Omicron Persei 8
        //profit:{$gte: co
     var saze = docs.length;
        console.log(dd,co,saze);
       // console.log(docs);
    })



    //
}

//анализируем цену
function Aprice(data){
 // console.log("Sell " + data[para].sell);
 //   console.log("Buy " + data[para].buy);
    var profit = data[strategy.v_para].sell / data[strategy.v_para].buy;
    if(profit > strategy.profit ){
        var dd = now.format('DD-MM-YYYY');
        var msg = {
            "Sell": data[strategy.v_para].sell,
            "Buy": data[strategy.v_para].buy,
            "profit": profit,
            "updated": data[strategy.v_para].updated,
            "DD": dd
        }
      //  console.log(msg);
        saveDB(msg);
    } else {
        console.log("Sell " + data[strategy.v_para].sell);
     console.log("Buy " + data[strategy.v_para].buy);
        console.log("updated " + data[strategy.v_para].updated);
    }
}


//получаем данные по цене
function Ticerss(f){

    publicClient.getTicker(function(err,data){
        if (err) {
            //logger.log('error', 'Ticers24', data);
           console.log(err);
        } else {
          //  logger.log('info', 'Ticers24 Start');
           // strategy.data = data;
         //  console.log(data);
            if(f){
                f(data);
            }
        }

        return true}, strategy.v_para);
}

//переодический запуск
var jobCron = {};

function CronVpAnaliz() {

    this.run = function () {
        jobCron[strategy.v_para] = new CronJob('*/15 * * * * *', function () {
                Ticerss(Aprice)
            }, function () {
                /* This function is executed when the job stops */

            },
            true /* Start the job right now */
            //timeZone /* Time zone of this job. */
        );
    }
    this.stat = function(){
         console.log("STAT");
        Viewer();
    }
}


var VpAnaliz = new CronVpAnaliz();
//module.exports = CronVpAnaliz;
//CronVpAnaliz("eth_btc");
//Ticerss(null,"eth_btc")

if(process.argv[3] == "stat") {
    VpAnaliz.stat();
} else {
    VpAnaliz.run();
}
