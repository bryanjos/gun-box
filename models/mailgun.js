var rest = require('restler');
var check = require('validator').check;
var mailgunApi = 'https://api.mailgun.net/v2';
var DB = require('../models/DB.js').DB;

exports.createRoute = function(domain, user, forwardingUrl, cb){
  try{
    check(domain.type, 'type is not mailgun').equals('mailgun');

    rest.post(mailgunApi + '/routes', {
      data: { priority: 2,
        description: 'webhook for ' + user.id,
        expression: 'match_recipient("' + user.id + '")',
        action: 'forward("' + forwardingUrl + '")' }
    }).on('complete', cb);
  }catch (err){
    cb(err, null);
  }
};


exports.saveMessage = function(message, cb){
  try{
    DB.connect(function(err, connection){
      if(err){
        cb(err, null);
      }else{
        DB.insert(connection, DB.tables.MESSAGES, message, cb);
      }
    });
  }catch (err){
    cb(err, null);
  }
};


exports.listReceivedMessages = function(userId, cb){
  try{
    DB.connect(function(err, connection){
      if(err){
        cb(err, null);
      }else{
        DB.filter(connection, DB.tables.MESSAGES, {recipient: userId}, cb);
      }
    });
  }catch (err){
    cb(err, null);
  }
};


exports.listSentMessages = function(userId, cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.filter(connection, DB.tables.MESSAGES, {from: userId}, cb);
    }
  });
};


exports.sendMail = function(userId, message, cb){
  try{
    check(message.from, 'from required').notNull().notEmpty();
    check(message.from, 'user and message.from do not match').equals(userId);
    var domain = userId.substr(userId.indexOf('@') + 1);

    rest.post(mailgunApi + '/' + domain + '/messages', {
      data: message
    }).on('complete', function(data, response) {
      if (response.statusCode == 200) {
        message['id'] = data.id;
        exports.saveMessage(message, cb);
      }else{
        cb(data, null);
      }
    });
  }catch (err){
    cb(err, null);
  }
};
