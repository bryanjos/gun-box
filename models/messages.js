var check = require('validator').check;
var DB = require('../models/DB.js').DB;


exports.saveMessage = function(message, cb){
  try{
    check(message.from, 'from required').notNull().notEmpty();

    DB.connect(function(err, connection){
      if(err){
        cb(err, null);
      }else{
        DB.insert(connection, DB.tables.MESSAGES, message, cb);
      }
    });
  }catch(err){
    cb(err, null);
  }

};


exports.listReceivedMessages = function(userId, cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.filter(connection, DB.tables.MESSAGES, {recipient: userId}, cb);
    }
  });
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



