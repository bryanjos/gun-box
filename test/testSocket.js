var should = require('should');
var api = require('supertest');
var app = require('../app.js').app;
var DB = require('../tasks/DB.js').DB;
var sockets = require('../tasks/sockets.js');


describe('Sockets', function () {
  var cookie;

  before (function (done) {
    DB.clear(function(err, results){
      api(app).post('/api/v1/admin/init').send({password: 'gellatin'}).expect(200, function(err, res){
        api(app).post('/api/v1/sign/in').send({username: 'admin', password: 'gellatin'}).expect(200, function(err, res){
          cookie = res.headers['set-cookie'];
          done();
        });
      });
    });
  });

  after(function (done) {
    DB.clear(function(err, results){
      done();
    });
  });

  it('should create a socket successfully', function (done) {
    sockets.create({id:'mojo@mojo.com', socketId: 'socket'}, function(err, res){
      should.not.exist(err);
      done();
    });
  });

  it('should get created socket', function (done) {
    sockets.get('mojo@mojo.com', function(err, res){
      should.not.exist(err);
      done();
    });
  });

  it('should delete socket', function (done) {
    sockets.delete('mojo@mojo.com', function(err, res){
      should.not.exist(err);
      done();
    });
  });
});