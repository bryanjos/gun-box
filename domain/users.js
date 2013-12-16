var bcrypt = require('bcrypt');
var db = require('../domain/db.js');
var tableName = 'users';


exports.Users = {
  find: function(conn, key, callback){
     db.find(conn, tableName, key, callback);
  },

  authenticate: function(conn, username, password, callback){
    this.find(conn, username, function(err, user){
       if(err){
         callback(err, null);
       }else{
         bcrypt.compare(password, user.password, function(err, res) {
           if(err){
             callback(err, null)
           } else if(res == false){
             callback(new Error('Invalid username or password'), null)
           }else{
             callback(err, user);
           }
         });
       }
    });
  }
};
