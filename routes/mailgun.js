var mailgun = require('../models/mailgun.js');
var config = require('../config.js').config;
var bcrypt = require('bcrypt');

exports.inbox = function(req, res){
  mailgun.saveMessage(req.body, function(err, res){
    if(err){
      res.send(500);
    }else{
      res.send(200);
    }
  });
};

