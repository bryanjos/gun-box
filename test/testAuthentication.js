var should = require('should');
var api = require('supertest');
var app = require('../app.js').app;
var DB = require('../models/DB.js').DB;


describe('Authentication', function () {
  var cookie;

  before (function (done) {
    DB.init(function(err, results){
      api(app).post('/api/v1/admin/init').send({password: 'gellatin'}).expect(200, function(err, result){
        done();
      });

    });
  });

  after(function (done) {
    DB.destroy(function(err, results){
      done();
    });
  });

  it('should authenticate a user', function (done) {
      api(app).post('/api/v1/sign/in').send({username: 'admin', password: 'gellatin'}).expect(200, function(err, res){
          cookie = res.headers['set-cookie'];
          done();
      });
  });

  it('should sign out authenticated user', function (done) {
      api(app).post('/api/v1/sign/out').set('cookie', cookie).expect(200, done);
  });
});