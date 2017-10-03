/**
 * Created by zews on 29.09.2017.
 */
    ////https://github.com/winstonjs/winston
var winston = require("winston");
var logfile = "./logs/appLog.txt";
var erfile = "./logs/error-file.txt";
function getlogger(module){

  //  console.log(module.filename.split('/').slice(-2).join("/"));
    var path = module.filename.split('/').slice(-2).join("/");
  return new (winston.Logger)({
        transports: [
    /*
            new (winston.transports.Console)({
                name: 'ErrorC',
                colorize: true,
                level: "error",
                label: path
            }),
   */
            new (winston.transports.Console)({
                name: 'infoC',
                colorize: true,
                level: "info",
                label: path
            }),
            new (winston.transports.File)({
                name: 'info-file',
                filename: logfile,
                label: path,
                level: "info"
            } ),
            new (winston.transports.File)({
                name: 'error-file',
                filename: erfile,
                label: path,
                level: "error"
            } )
        ]
        // json: false
    });
}

module.exports = getlogger;


//logger.log('info', 'Hello distributed log files!');
//logger.info('Hello again distributed logs');
//logger.log('info', 'Test Log Message', { anything: 'This is metadata' });