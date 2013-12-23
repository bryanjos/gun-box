var DB = require('./DB.js').DB;


exports.get = function(id, cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.get(connection, DB.tables.SOCKETS, id, cb);
    }
  });
};

exports.create = function(session, cb){
    DB.connect(function(err, connection){
      if(err){
        cb(err, null);
      }else{
        DB.insert(connection, DB.tables.SOCKETS, session, cb);
      }
    });
};

exports.delete = function(id, cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.delete(connection, DB.tables.SOCKETS, id, cb);
    }
  });
};
