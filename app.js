
/**
 * Module dependencies.
 */

var express = require('express');
var passport = require('passport');
var auth = require('./auth.js');
var routes = require('./routes');
var admin = require('./routes/admin');
var config = require('./config.js').config;
var http = require('http');
var path = require('path');

var app = express();

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
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/admin', auth.authorize('admin'), admin.index);
app.get('/admin/sign/up', admin.signUp);
app.post('/admin/sign/up', admin.signUpPost);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
