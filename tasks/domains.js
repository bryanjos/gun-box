var check = require('validator').check;
var DB = require('./DB.js').DB;


exports.get = function(id, cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.get(connection, DB.tables.DOMAINS, id, cb);
    }
  });
};


exports.getByUserId = function(userId, cb){
  var domain = userId.substr(userId.indexOf('@') + 1);

  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.get(connection, DB.tables.DOMAINS, domain, cb);
    }
  });
};

exports.list = function(cb){
  DB.connect(function(err, connection){
    if(err){
      cb(err, null);
    }else{
      DB.list(connection, DB.tables.DOMAINS, cb);
    }
  });
};

exports.create = function(domain, cb){
  try{
    check(domain.id, 'id is required. id is the domain name of the domain you want to add').notNull().notEmpty();
    check(domain.type, 'type is required. The only accepted type is mailgun').notNull().notEmpty();

    if(domain.type === 'mailgun'){
      check(domain.publicKey, 'publicKey is required for mailgun type').notNull().notEmpty();
      check(domain.secretKey, 'secretKey is required for mailgun type').notNull().notEmpty();
    }

    DB.connect(function(err, connection){
      if(err){
        cb(err, null);
      }else{
        DB.insert(connection, DB.tables.DOMAINS, domain, cb);
      }
    });

  }catch(err){
    cb(err, null);
  }
};

exports.update = function(id, domain, cb){

  try{
    check(domain.type, 'type is required. The only accepted type is mailgun').notNull().notEmpty();

    if(domain.type === 'mailgun'){
      if(domain.publicKey !== undefined){
        check(domain.publicKey, 'publicKey is required for mailgun type').notEmpty();
      }

      if(domain.secretKey !== undefined){
        check(domain.secretKey, 'secretKey is required for mailgun type').notEmpty();
      }
    }

    DB.connect(function(err, connection){
      if(err){
        cb(err, null);
      }else{
        DB.update(connection, DB.tables.DOMAINS, id, domain, cb);
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
      DB.delete(connection, DB.tables.DOMAINS, id, cb);
    }
  });
};