var domains = require('../tasks/domains.js');

exports.list = function(req, res){
  domains.list(function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200, result);
    }
  });
};

exports.create = function(req, res){
  domains.create(req.body, function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200);
    }
  });
};

exports.update = function(req, res){
  domains.update(req.params.id, req.body, function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200);
    }
  });
};

exports.delete = function(req, res){
  domains.delete(req.params.id, function(err, result){
    if(err){
      res.send(500, err);
    }else{
      res.send(200);
    }
  });
};