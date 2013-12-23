var users = require('../tasks/users.js');

exports.init = function(req, res){
  users.createAdmin(req.body, function(err, result){
     if(err){
       res.send(500, err);
     }else{
       res.send(200, 'Account "admin" created successfully');
     }
  });
};
