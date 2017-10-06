/**
 * Created by zews on 29.09.2017.
 */
var CronJob = require('cron').CronJob;
var express = require("express");
var http =  require("http");
var path =  require("path");
var config =  require("./config");
var connect = require('connect');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var cookie = require('cookie');
var errorhandler = require('errorhandler');
var session = require('express-session');
var methodOverride = require('method-override');
var serveStatic = require('serve-static');
//var nullWallet = require('./middleware/nw.js');
var nullWallet = require('./libs/bitnw.js');
var log = require("./libs/log.js")(module);
var uuidv4 = require("uuid/v4");
//var ejs = require('ejs');
//console.log(uuidv4());

var app = express();
//app.set("port",3000);
app.set("port",config.get("port"));
//app.set("views",__dirname + "/tempates");
//app.set("view engine", "ejs");


app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/tempates');
app.set('view engine', 'ejs');


var server = http.createServer(app);
var io = require('socket.io')(server);
    server.listen(app.get("port"),function(){
  log.info("server start",app.get("port"));
});
app.set('io', io);
io.origins(['localhost:3000']);
//io.set("logger",log);


io.use(function(socket, next) {
    var handshakeData = socket.request;
 //   handshake.cookies = cookieParser(handshake.headers.cookie || '');
  //  var sidCookie = handshakeData["sid"];
 //   var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));
    // make sure the handshake data looks good as before
    // if error do this:
    // next(new Error('not authorized'));
    // else just call next
  //  console.log(handshake.cookies);
    next();
});


//app.use(favicon(favicon(path.join(__dirname, 'public', 'favicon.ico'))));




app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
//var urlencodedParser = bodyParser.urlencoded({extended: false});


app.use(cookieParser());

/*
app.use(cookieSession({
    secret: config.get("session:secret"),
    key: config.get("session:key"),
    cookie: config.get("session:cookie"),
    resave: false,
    saveUninitialized: true
}));

 */

app.use(session({
    secret: config.get("session:secret"),
    key: config.get("session:key"),
    cookie: config.get("session:cookie"),
    resave: false,
    saveUninitialized: true
 /*
    secret: 'a4f8071f-c873-4447-8ee2'
    cookie: { maxAge: 2628000000 },
    store: new (require('express-sessions'))({
        storage: 'redis',
        instance: client, // optional
        host: 'localhost', // optional
        port: 6379, // optional
        collection: 'sessions', // optional
        expire: 86400 // optional

    })
    //
  */

}));



////////////////////////////////////////////////////
function test(id){
    this.run = function(soc) {
        socket = soc;
        co[id] = 0;
        msgID[id] = new CronJob('*/1 * * * * *', function () {
                co[id]++;
                socket.emit(id, {hello: id});
                console.log(id, msgID[id].running, co[id]);

                if (co[id] == 30) {
                    msgID[id].stop();
                }
            }, function () {
                /* This function is executed when the job stops */

            },
            true /* Start the job right now */
            //timeZone /* Time zone of this job. */
        );
    }
}
////////////////////////////////////////////////////////////////////
var msgID = {};
var co = {};
/////
var tuuis = {};
var globals =  require("./libs/bitnw.js");
app.use(function(req,res,next){
    req.session.counter = req.session.counter || 0;
    req.session.counter++;
    console.log(req.session.counter);
    if(!req.session.userId){
        req.session.userId = uuidv4();
        console.log(req.session.userId);
          tuuis[req.session.userId] = new globals(req.session.userId);
    }
   // console.log("userId",req.session.userId);
    next();
})

app.get("/",function(req,res,next){

    // var re = app.get("port");
    res.render("te",{"title": "Друг!"});
});
//
//var nw = require("./middleware/nw.js");
app.get("/nw",function(req,res,next){

      res.render("nw",{"title": "Утилита CurrencyToBTC"});
});
//


io.on('connection', function (socket) {
    //

    socket.on('RPC', function(data) {
        // io.sockets.emit('user disconnected');
        if(data.access.run == "nulwallet_start"){
            var id =  data.access.toolsObjc;
            tuuis[id].run(socket);
        }

    });
    socket.on('disconnect', function () {
        log.info("User разорвал соединение -- app");
    });
});

//
app.post('/nwst', function (req, res,next) {
    if (!req.body)
        return res.sendStatus(400);
             else {
        //
        tuuis[req.session.userId].info(req.body);
        res.render("nws",{"title": "Приложение запущено","userId":req.session.userId});
    }

    });

//
app.use(serveStatic(path.join(__dirname, 'public')));


app.use(function(req,res,next){
    if (req.url == "/errors"){
        next(new Error("Типа Ошибка"));
       // res.send(404,"Jib,cz");
    }else {
        next();
    }

});


//404
app.use(function(req,res,next){
       res.render("404",{"title": "Возможно вы ошиблись!"});
    //   res.status(404);
      //  res.send(404,"Нету такой страницы");
    });

app.use(errorhandler());



