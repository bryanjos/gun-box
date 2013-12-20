var users = require('../models/users.js');

exports.init = function(req, res){
  users.InitializeAdmin(req.body, function(err, result){
     if(err){
       res.send(500, err);
     }else{
       res.send(200, 'Account "admin" created successfully');
     }
  });
};


exports.createDomainUser = function(req, res){
  users.CreateDomainUser(req.body, function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200, result);
    }
  });
};
