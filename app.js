/**
 * Created by zews on 29.09.2017.
 */

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
var errorhandler = require('errorhandler');
var session = require('express-session');
var methodOverride = require('method-override');
var serveStatic = require('serve-static');
var nullWallet = require('./middleware/nw.js');
var log = require("./libs/log.js")(module);
//var ejs = require('ejs');


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

//app.use(favicon(favicon(path.join(__dirname, 'public', 'favicon.ico'))));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
//var urlencodedParser = bodyParser.urlencoded({extended: false});


app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));


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




app.get("/",function(req,res,next){

    // var re = app.get("port");
    res.render("te",{"title": "Друг!"});
});
//
//var nw = require("./middleware/nw.js");
app.get("/nw",function(req,res,next){
  res.render("nw",{"title": "Обнуляем кошельки!"});
});
//


//

app.post('/nwst', function (req, res,next) {
    if (!req.body) return res.sendStatus(400);
   // res.send('welcome, ' + req.body.key);
   // console.log("req.body",req.body);

    if(nullWallet.info(req.body) == 1000){
           next(new Error("Ошибка code: 1000"));
         // res.render("nws",{"title": "Запускаем приложение"});
    }
     //
        res.render("nws",{"title": "Приложение запущено"});
    io.on('connection', function (socket) {
        nullWallet.run(socket);
        socket.on('disconnect', function () {
           // io.sockets.emit('user disconnected');
           log.info("User разорвал соединение -- app");


       });

     });

});


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



