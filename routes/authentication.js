exports.signIn = function(req, res){
  delete req.user.password;
  res.send(200, req.user);
};

exports.signOut = function(req, res){
  req.logout();
  res.send(200);
};
