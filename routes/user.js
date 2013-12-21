var users = require('../models/users.js');

exports.list = function(req, res){
  users.list(function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200, result);
    }
  });
};

exports.create = function(req, res){
  users.create(req.body, function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200, result);
    }
  });
};

exports.update = function(req, res){
  users.update(req.user.id, req.body, function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200);
    }
  });
};

exports.delete = function(req, res){
  users.delete(req.params.id, function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200);
    }
  });
};