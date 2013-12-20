
/**
 * Module dependencies.
 */

var express = require('express');
var passport = require('passport');
var auth = require('./auth.js');
var admin = require('./routes/admin');
var domain = require('./routes/domain');
var authentication = require('./routes/authentication');
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
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}


var api = '/api/v1';

var apiAdmin = api + '/admin';
app.post(apiAdmin + '/init', admin.init);
app.post(apiAdmin + '/user', auth.authorize('admin'), admin.createDomainUser);

var apiDomains = api + '/domains';
app.get(apiDomains, auth.authorize('admin'), domain.list);
app.post(apiDomains, auth.authorize('admin'), domain.create);
app.put(apiDomains + '/:key', auth.authorize('admin'), domain.update);
app.delete(apiDomains + '/:key', auth.authorize('admin'), domain.delete);

var apiAuthentication = api + '/sign';
app.post(apiAuthentication + '/in', passport.authenticate('local'), authentication.signIn);
app.post(apiAuthentication + '/out', auth.authorize('user'), authentication.signOut);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

exports.app = app;
