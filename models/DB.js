var r = require('rethinkdb');
var config = require('../config.js').config;


exports.DB = {
  tables: {
    DOMAINS: 'domains',
    USERS: 'users'
  },

  init: function (callback) {
    r.connect(config.rethinkdb, function (err, connection) {
      if (err) {
        callback(err, null);
      } else {
        r.dbCreate(config.rethinkdb.db)
          .run(connection, function (err, results) {
            if (err) {
              callback(err, null);
            } else {
              r.tableCreate(exports.DB.tables.USERS).run(connection, function (err, results) {
                if (err) {
                  callback(err, null);
                } else {
                  r.tableCreate(exports.DB.tables.DOMAINS).run(connection, callback);
                }
              });
            }
          });
      }
    });
  },

  destroy: function (callback) {
    r.connect(config.rethinkdb, function (err, connection) {
      if (err) {
        callback(err, null);
      } else {
        r.tableDrop(exports.DB.tables.USERS)
          .run(connection, function (err, results) {
            if (err) {
              callback(err, null);
            } else {
              r.tableDrop(exports.DB.tables.DOMAINS).run(connection, function (err, results) {
                if (err) {
                  callback(err, null);
                } else {
                  r.dbDrop(config.rethinkdb.db).run(connection, callback);
                }
              });
            }
          });
      }
    });
  },

  connect: function (callback) {
    r.connect(config.rethinkdb, callback);
  },

  get: function (conn, tableName, key, callback) {
    r.table(tableName).get(key).run(conn, callback);
  },

  list: function (conn, tableName, callback) {
    r.table(tableName).run(conn, function(err, cursor){
      if(err){
        callback(err, null);
      }else{
        cursor.toArray(callback);
      }
    });
  },

  listWithFields: function (conn, tableName, fields, callback) {
    r.table(tableName).withFields(fields).run(conn, function(err, cursor){
      if(err){
        callback(err, null);
      }else{
        cursor.toArray(callback);
      }
    });
  },

  filter: function (conn, tableName, query, callback) {
    r.table(tableName).filter(query).run(conn, function(err, cursor){
      if(err){
        callback(err, null);
      }else{
        cursor.toArray(callback);
      }
    });
  },

  insert: function (conn, tableName, item, callback) {
    r.table(tableName).insert(item).run(conn, callback);
  },

  update: function (conn, tableName, key, item, callback) {
    r.table(tableName).get(key).update(item).run(conn, callback);
  },

  delete: function (conn, tableName, key, callback) {
    r.table(tableName).get(key).delete().run(conn, callback);
  }
};


