var should = require('should');
var api = require('supertest');
var app = require('../app.js').app;
var DB = require('../models/DB.js').DB;


describe('Admin', function () {
  var cookie;
  var password;


  before (function (done) {
    DB.clear(function(err, results){
      done();
    });
  });

  after(function (done) {
    DB.clear(function(err, results){
      done();
    });
  });


  it('should return 500 when password is not present', function (done) {
    api(app).post('/api/v1/admin/init').expect(500, done);
  });

  it('should return 200 when password is given', function (done) {
    api(app).post('/api/v1/admin/init').send({password: 'gellatin'}).expect(200, done);
  });

  it('should return 500 when admin already defined', function (done) {
    api(app).post('/api/v1/admin/init').send({password: 'gellatin'}).expect(500, done);
  });

  it('should return 200 when admin signs in', function (done) {
    api(app).post('/api/v1/sign/in').send({username: 'admin', password: 'gellatin'}).expect(200, function(err, res){
      cookie = res.headers['set-cookie'];
      done();
    });
  });

  it('should return 200 when sign admin out', function (done) {
    api(app).post('/api/v1/sign/out').set('cookie', cookie).expect(200, done);
  });

});