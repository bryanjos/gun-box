exports.signIn = function(req, res){
  res.send(200);
};

exports.signOut = function(req, res){
  req.logout();
  res.send(200);
};
