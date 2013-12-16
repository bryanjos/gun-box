var r = require('rethinkdb');
var config = require('../config.js').config;


exports.connect = function(callback){
  r.connect(config.rethinkdb, callback);
};

exports.createDb = function(conn, callback){
  r.dbCreate(config.rethinkdb.db).run(conn, callback);
};

function createTable(conn, name, callback){
  r.tableCreate(config.rethinkdb.db).tableCreate(name).run(conn, callback);
}

exports.createUsersTable = function(conn, callback){
  createTable(conn, 'users', callback);
};

exports.find = function(conn, tableName, key, callback){
  r.table(tableName).get(key).run(conn, callback);
};

exports.filter = function(conn, tableName, query, callback){
  r.table(tableName).filter(query).run(conn, callback);
};


