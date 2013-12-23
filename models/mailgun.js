var rest = require('restler');
var check = require('validator').check;
var messages = require('../models/messages.js');
var mailgunApi = 'https://api.mailgun.net/v2';

exports.createRoute = function(user, forwardingUrl, cb){
  rest.post(mailgunApi + '/routes', {
    data: { priority: 2,
      description: 'webhook for ' + user.id,
      expression: 'match_recipient("' + user.id + '")',
      action: 'forward("' + forwardingUrl + '")' }
  }).on('complete', cb);
  //TODO: save route id to user
};


exports.deleteRoute = function(routeId, cb){
  rest.delete(mailgunApi + '/routes/' + routeId).on('complete', cb);
};


exports.sendMail = function(userId, message, cb){
  try{
    check(message.from, 'from required').notNull().notEmpty();
    check(message.from, 'user and message.from do not match').equals(userId);
    var domain = userId.substr(userId.indexOf('@') + 1);

    rest.post(mailgunApi + '/' + domain + '/messages', {
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
