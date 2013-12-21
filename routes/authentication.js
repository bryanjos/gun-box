var DB = require('../models/DB.js').DB;
var config = require('../config.js').config;
var bcrypt = require('bcrypt');

exports.signIn = function(req, res){
  delete req.user.password;
  res.send(200, req.user);
};

exports.signOut = function(req, res){
  req.logout();
  res.send(200);
};
