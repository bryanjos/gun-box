var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var underscore = require('underscore')._;
var bcrypt = require('bcrypt');
var DB = require('./tasks/DB.js').DB;
var users = require('./tasks/users.js');

passport.use(new LocalStrategy(
  function(username, password, done) {
    DB.connect(function(err, connection){
      if(err){
        return done(null, false, { message: 'Unable to connect to database.' });
      }else{
        this.authenticate(connection, username, password, function(err, user){
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
          }
          return done(null, user);
        });
      }
    });
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  DB.connect(function(err, connection){
    if(err){
       done(err, null);
    }else{
      users.get(id, function(err, user) {
        done(err, user);
      });
    }
  });
});


exports.authorize = function(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.roles.indexOf(role) > -1){
      next();
    }else{
      res.send(401, 'Unauthorized');
    }
  };
};


authenticate = function(conn, username, password, callback){
  users.get(username, function(err, user){
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
};