var rest = require('restler');
var check = require('validator').check;
var mailgunApi = 'https://api.mailgun.net/v2';
var DB = require('../models/DB.js').DB;

exports.createRoute = function(domain, user, forwardingUrl, callback){
  try{
    check(domain.type, 'type is not mailgun').equals('mailgun');

    rest.post(mailgunApi + '/routes', {
      data: { priority: 2,
        description: 'webhook for ' + user.id,
        expression: 'match_recipient("' + user.id + '")',
        action: 'forward("' + forwardingUrl + '")' }
    }).on('complete', callback);
  }catch (err){
    callback(err, null);
  }
};


exports.insert = function(message, callback){
  try{
    check(domain.type, 'type is not mailgun').equals('mailgun');

    rest.post(mailgunApi + '/routes', {
      data: { priority: 2,
        description: 'webhook for ' + user.id,
        expression: 'match_recipient("' + user.id + '")',
        action: 'forward("' + forwardingUrl + '")' }
    }).on('complete', callback);
  }catch (err){
    callback(err, null);
  }
};
