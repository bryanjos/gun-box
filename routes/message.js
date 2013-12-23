var messages = require('../models/messages.js');
var domains = require('../models/domains.js');
var mailgun = require('../models/mailgun.js');
var sockets = require('../models/sockets.js');
var config = require('../config.js').config;
var bcrypt = require('bcrypt');
var io = require('../app.js').io;
var check = require('validator').check;

exports.inbox = function(req, res){
  try{
    //Check to make sure messages are only coming from mailgun
    check(req.url).contains('mailgun.net');

    messages.saveMessage(req.body, function(err, res){
      if(err){
        res.send(500);
      }else{
        sockets.get(req.body.recipient, function(err, session){
          if(err){

          }else{
            io.sockets.socket(session.socketId).emit(req.body);
          }
          res.send(200);
        });
      }
    });
  }catch(err){
    res.send(401);
  }
};


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
     if(err || domain == null){
       var error = new Error();
       error.message = 'Domain not found';
       res.send(500, error);
     }else if(domain.type != 'mailgun'){
       var error = new Error();
       error.message = 'Domain is not of type mailgun';
       res.send(500, error);
     }else{
       mailgun.sendMail(req.user.id, req.body, function(err, result){
         if(err){
           res.send(500, err);
         }else{
           res.send(200, result);
         }
       });
     }
  });


};

