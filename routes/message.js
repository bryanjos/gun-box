var messages = require('../tasks/messages.js');
var domains = require('../tasks/domains.js');
var mailgun = require('../tasks/mailgun.js');
var config = require('../config.js').config;
var bcrypt = require('bcrypt');
var check = require('validator').check;

exports.listReceived = function(req, res){
  messages.listReceivedMessages(req.user.id, function(err, messages){
    if(err){
      res.send(500, err);
    }else{
      res.send(200, messages);
    }
  });
};


exports.listSent = function(req, res){
  messages.listSentMessages(req.user.id, function(err, messages){
    if(err){
      res.send(500, err);
    }else{
      res.send(200, messages);
    }
  });
};


exports.sendMessage = function(req, res){
  domains.getByUserId(req.user.id, function(err, domain){
    var error = new Error();
     if(err || domain == null){
       error.message = 'Domain not found';
       res.send(500, error);
     }else if(domain.type !== 'mailgun'){
       error.message = 'Domain is not of type mailgun';
       res.send(500, error);
     }else{
       mailgun.sendMail(domain, req.user.id, req.body, function(err, result){
         if(err){
           res.send(500, err);
         }else{
           res.send(200, result);
         }
       });
     }
  });


};

