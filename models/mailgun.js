var rest = require('restler');
var check = require('validator').check;
var messages = require('../models/messages.js');
var mailgunApi = 'https://api.mailgun.net/v2';


//mocking mailgun for testing. Is this ok?
if(process.env.NODE_ENV === 'test'){
  var routes = [];

  exports.createRoute = function(domain, user, forwardingUrl, cb){
    routes.push(forwardingUrl);
    cb({route: {id: routes.length-1}}, {statusCode:200});
  };


  exports.deleteRoute = function(domain, routeId, cb){
    routes.splice(routeId, 1);
    cb(null, null);
  };


  exports.sendMail = function(domain, userId, message, cb){
    try{
      check(message.from, 'from required').notNull().notEmpty();
      check(message.from, 'user and message.from do not match').equals(userId);

      messages.saveMessage(message, cb);
    }catch (err){
      cb(err, null);
    }
  };

}else{


  exports.createRoute = function(domain, user, forwardingUrl, cb){
    rest.post(mailgunApi + '/routes', {
      username:'api',
      password:domain.secretKey,
      data: { priority: 2,
        description: 'webhook for ' + user.id,
        expression: 'match_recipient("' + user.id + '")',
        action: 'forward("' + forwardingUrl + '")' }
    }).on('complete', cb);
  };


  exports.deleteRoute = function(domain, routeId, cb){
    rest.delete(mailgunApi + '/routes/' + routeId,
      {
        username:'api',
        password:domain.secretKey
      }
    ).on('complete', cb);
  };


  exports.sendMail = function(domain, userId, message, cb){
    try{
      check(message.from, 'from required').notNull().notEmpty();
      check(message.from, 'user and message.from do not match').equals(userId);

      rest.post(mailgunApi + '/' + domain.id + '/messages', {
        username:'api',
        password:domain.secretKey,
        data: message
      }).on('complete', function(data, response) {
          if (response.statusCode === 200) {
            message['id'] = data.id;
            messages.saveMessage(message, cb);
          }else{
            cb(data, null);
          }
        });
    }catch (err){
      cb(err, null);
    }
  };
}



