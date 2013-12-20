var DB = require('../models/DB.js').DB;
var config = require('../config.js').config;
var bcrypt = require('bcrypt');

exports.signIn = function(req, res){
  res.send(200);
};

exports.signOut = function(req, res){
  req.logout();
  res.send(200);
};
