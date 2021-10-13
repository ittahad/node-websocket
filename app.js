process.env.NODE_ENV = 'prod';

var express = require('express');
var http = require('http');
const socketio = require('socket.io');
const AppSettings = require(`./config.${process.env.NODE_ENV}`);
var app = express();
var swagger = require('./swagger')(app);
var server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  }
});

exports.server = server;
exports.socketIo = io;

const config = new AppSettings();
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socketUtils = require('./socketUtils');
var SecurityContext = require('libidentity');
const securityContext = new SecurityContext(config);
var logger = require('morgan');

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

io.on('connection', (socket) => {
  securityContext.verifySocketToken(socket, socketUtils.socketUtility);
});

// app.use(function(req, res, next){
//   socketUtls.socketIOFunc(next);
//   return next()
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var socketRouter = require('./routes/socketRouter');
var socketUtls = require('./socketUtils');

app.use('/', socketRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  let test = req.app.get('env');
  res.locals.error = req.app.get('env') === 'dev' ? err : {};
});

exports.app = app;

