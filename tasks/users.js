var check = require('validator').check;
var DB = require('./DB.js').DB;
var domains = require('./domains.js');
var config = require('../config.js').config;
var roles = require('../config.js').roles;
var bcrypt = require('bcrypt');
var saltLength = 8;
var passwordLength = 8;
var mailgun = require('./mailgun.js');


exports.createAdmin = function(admin, callback){
  var adminUsername = 'admin';
  try{
    check(admin.password, 'password is required').notNull().notEmpty();
    DB.connect(function(err, connection){
      DB.get(connection, DB.tables.USERS, adminUsername, function(err, user) {
        if(user == null){
            bcrypt.hash(admin.password, saltLength, function(err, hash) {
              if(err){
                callback(err, null);
              }else{
                DB.insert(connection, DB.tables.USERS, { id: adminUsername, password: hash, roles: roles }, function(err, results){
                  if(err){
                    callback(err, null);
                  }else{
                    callback(null, results);
                  }
                });
              }
            });
        }else{
          var error = new Error();
          error.message = 'Account "' + adminUsername +'" already exists';
          callback(error, null);
        }
      });
    });
  }catch (err){
    callback(err, null);
  }
};

function generateRandomPassword(length){
    var password = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ ){
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return password;
}


exports.create = function(user, forwardingUrl, callback){
  try{
    check(user.id, 'id is required').notNull().notEmpty();
    check(user.id, 'id must be of the form "<username>@<domain>"').contains('@');
    var domain = user.id.substr(user.id.indexOf('@') + 1);
    DB.connect(function(err, connection){
      domains.get(domain, function(err, domain){
        if(domain == null){
          var error = new Error();
          error.message = 'Domain does not exist';
          callback(error, null);
        }else{
          DB.get(connection, DB.tables.USERS, user.id, function(err, oldUser) {
            if(oldUser == null){
              var generatedPassword = generateRandomPassword(passwordLength);
              bcrypt.hash(generatedPassword, saltLength, function(err, hash) {
                if(err){
                  callback(err, null);
                }else{
                  DB.insert(connection, DB.tables.USERS, { id: user.id, password: hash, roles: ['user'] }, function(err, results){
                    if(err){
                      callback(err, null);
                    }else{
                      if(domain.type === 'mailgun'){
                         mailgun.createRoute(domain, user, forwardingUrl, function(data, response){
                           if(response.statusCode === 200){
                             user.routeId = data.route.id;
                             DB.update(connection, DB.tables.USERS, user.id, user, function(){
                               if(err){
                                 DB.delete(connection, DB.tables.USERS, user.id, function(){
                                   var error = new Error();
                                   error.message = 'An error occured while creating the mailgun route.';
                                   callback(error, null);
                                 });
                               }else{
                                 callback(null, { password: generatedPassword });
                               }
                             });
                           }else{
                             DB.delete(connection, DB.tables.USERS, user.id, function(){
                               var error = new Error();
                               error.message = 'An error occured while creating the mailgun route.';
                               callback(error, null);
                             });
                           }
                         });
                      }else{
                        callback(null, { password: generatedPassword });
                      }
                    }
                  });
                }
              });
            }else{
              var error = new Error();
              error.message = 'Account "' + user.id + '" already exists';
              callback(error, null);
            }
          });
        }
      });

    });
  }catch (err){
    callback(err, null);
  }
};

exports.get = function(id, cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.get(connection, DB.tables.USERS, id, cb);
    }
  });
};

exports.list = function(cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.listWithFields(connection, DB.tables.USERS, 'id', cb);
    }
  });
};


exports.update = function(id, user, cb){

  try{
    check(user.password, 'password is required.').notNull().notEmpty();

    DB.connect(function(err, connection){
      if(err){
        cb(err, null);
      }else{
        bcrypt.hash(user.password, saltLength, function(err, hash) {
          if(err){
            cb(err, null);
          }else{
            DB.update(connection, DB.tables.USERS, id, {password: hash}, cb);
          }
        });
      }
    });
  }catch(err){
    cb(err, null);
  }
};

exports.delete = function(id, cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      var domain = id.substr(id.indexOf('@') + 1);
      domains.get(domain, function(err, domain){
        if(domain.type === 'mailgun'){
          DB.get(connection, DB.tables.USERS, id, function(err, user){
            if(user != null){
              mailgun.deleteRoute(domain, user.routeId, function(){
                DB.delete(connection, DB.tables.USERS, id, cb);
              });
            }
          });
        }else{
          DB.delete(connection, DB.tables.USERS, id, cb);
        }
      });
    }
  });
};
