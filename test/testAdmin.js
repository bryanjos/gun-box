var should = require('should');
var api = require('supertest');
var app = require('../app.js').app;
var DB = require('../models/DB.js').DB;


describe('Admin', function () {
  var cookie;
  var password;


  before (function (done) {
    DB.init(function(err, results){
      done();
    });
  });

  after(function (done) {
    DB.destroy(function(err, results){
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

  it('should return 200 when admin creates domain', function (done) {
    api(app).post('/api/v1/domains')
      .set('cookie', cookie)
      .send({id: 'domain.com', type: 'mailgun', publicKey: 'public', secretKey: 'secret'})
      .expect(200, done);
  });

  it('should return 500 adding user without id', function (done) {
    api(app).post('/api/v1/admin/user').set('cookie', cookie).send({id: ''}).expect(500, function(err, res){
      res.body.message.should.equal( 'id is required');
      done();
    });
  });

  it('should return 500 adding user with id that is not valid', function (done) {
    api(app).post('/api/v1/admin/user').set('cookie', cookie).send({id: 'mojo'}).expect(500, function(err, res){
      res.body.message.should.equal('id must be of the form "<username>@<domain>"');
      done();
    });
  });

  it('should return 500 adding user with id contains invalid domain', function (done) {
    api(app).post('/api/v1/admin/user').set('cookie', cookie).send({id: 'mojo@mojo.com'}).expect(500, function(err, res){
      res.body.message.should.equal('Domain does not exist');
      done();
    });
  });

  it('should return 200 adding user with valid id', function (done) {
    api(app).post('/api/v1/admin/user').set('cookie', cookie).send({id: 'mojo@domain.com'}).expect(200, function(err, res){
      password = res.body.password;
      done();
    });
  });

  it('should return 200 when sign admin out', function (done) {
    api(app).post('/api/v1/sign/out').set('cookie', cookie).expect(200, done);
  });


  it('should authenticate created user', function (done) {
    api(app).post('/api/v1/sign/in').send({username: 'mojo@domain.com', password: password}).expect(200, done);
  });

});