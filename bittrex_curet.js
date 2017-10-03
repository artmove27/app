/**
 * Created by zews on 28.09.2017.
 */
var appB = require('./mod/b_conf.js');
var bittrex = require('node.bittrex.api');
var jsonfile = require('jsonfile');
var appfile = './data/bittrex_conf.json';



bittrex.options({
    'apikey' : appB.key,
    'apisecret' : appB.sig
});

var napp ={};
napp.key = appB.key;
napp.sig = appB.sig;
    napp.BTC_Limit=appB.BTC_Limit;
    napp.levellog = appB.levellog;
napp.wallet = {};
function count() {

    bittrex.getcurrencies(function( data, err ) {
        if (err) {
            console.log(err);
        } else {
            var co = 0;
            for(key in data.result){

               if(data.result[key].IsActive && data.result[key].Currency !="BTC" ){
                   var Currency =data.result[key].Currency;
                   var vpara = "BTC-"+ data.result[key].Currency;
                   napp.wallet[Currency]=vpara;
                   console.log(appB.wallet[Currency]);
                   co++;
               }

            }
            //
            napp.Currency_country = co;
            jsonfile.writeFile(appfile, napp, function (err) {
                console.error(err)
            })

        }
    });

};
//getcurrencies
count();
