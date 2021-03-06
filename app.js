
/**
 * Module dependencies.
 */


var express = require('express');
var passport = require('passport');
var auth = require('./auth.js');
var admin = require('./routes/api/v1/admin');
var domain = require('./routes/api/v1/domain');
var user = require('./routes/api/v1/user');
var authentication = require('./routes/api/v1/authentication');
var message = require('./routes/api/v1/message');
var config = require('./config.js').config;
var http = require('http');
var path = require('path');
var DB = require('./tasks/DB.js').DB;
var sockets = require('./tasks/sockets.js');
var messages = require('./tasks/messages.js');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.set('port', config.port || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.appKey));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}


var api = '/api/v1';

var apiAdmin = api + '/admin';
app.post(apiAdmin + '/init', admin.init);

var apiDomains = api + '/domains';
app.get(apiDomains, auth.authorize('admin'), domain.list);
app.post(apiDomains, auth.authorize('admin'), domain.create);
app.put(apiDomains + '/:id', auth.authorize('admin'), domain.update);
app.delete(apiDomains + '/:id', auth.authorize('admin'), domain.delete);

var apiUsers = api + '/users';
app.get(apiUsers, auth.authorize('user'), user.list);
app.post(apiUsers, auth.authorize('admin'), user.create);
app.put(apiUsers, auth.authorize('user'), user.update);
app.delete(apiUsers + '/:id', auth.authorize('admin'), user.delete);

var apiAuthentication = api + '/sign';
app.post(apiAuthentication + '/in', passport.authenticate('local'), authentication.signIn);
app.post(apiAuthentication + '/out', auth.authorize('user'), authentication.signOut);


var apiMailGun = api + '/mailgun';
app.get(apiMailGun + '/received',auth.authorize('user'), message.listReceived);
app.get(apiMailGun + '/sent',auth.authorize('user'), message.listSent);
app.post(apiMailGun + '/send',auth.authorize('user'), message.sendMessage);


app.post(apiMailGun + '/inbox', function(req, res){
  messages.saveMessage(req.body, function(err, result){
    if(err){
      res.send(500);
    }else{
      sockets.get(req.body.recipient, function(err, session){
        if(!err && session){
          io.sockets.socket(session.socketId).emit(req.body);
        }
        res.send(200);
      });
    }
  });
});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));

  DB.init(function(err, res){
    if(err){
      console.log(err.message);
    }
  });

  io.sockets.on('connection', function (socket) {
    socket.on('ready', function (data) {
      //save socketId so that we can send data to the user
      sockets.create({id: data.id, socketId: socket.id}, function(){

      });
    });
  });
});






exports.app = app;
exports.io = io;
