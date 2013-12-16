var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var underscore = require('underscore')._;
var Users = require('./domain/users.js').Users;
var db = require('./domain/db.js');

passport.use(new LocalStrategy(
  function(username, password, done) {
    db.connect(function(err, connection){
      if(err){
        return done(null, false, { message: 'Unable to connect to database.' });
      }else{
        Users.authenticate(connection, username, password, function(err, user){
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
  db.connect(function(err, connection){
    if(err){
       done(err, null);
    }else{
      Users.find(connection, id, function(err, user) {
        done(err, user);
      });
    }
  });
});


exports.authorize = function(role) {
  return [
    passport.authenticate('local'),
    function(req, res, next) {
      if (req.user && underscore.contains(req.user.roles, role))
        next();
      else
        res.send(401, 'Unauthorized');
    }
  ];
};