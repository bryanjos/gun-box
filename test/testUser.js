var should = require('should');
var api = require('supertest');
var app = require('../app.js').app;
var DB = require('../models/DB.js').DB;


describe('Users', function () {
  var cookie;
  var password;

  before (function (done) {
    DB.init(function(err, results){
      api(app).post('/api/v1/admin/init').send({password: 'gellatin'}).expect(200, function(err, res){
        api(app).post('/api/v1/sign/in').send({username: 'admin', password: 'gellatin'}).expect(200, function(err, res){
          cookie = res.headers['set-cookie'];
          done();
        });
      });
    });
  });

  after(function (done) {
    DB.destroy(function(err, results){
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
    api(app).post('/api/v1/users').set('cookie', cookie).send({id: ''}).expect(500, function(err, res){
      res.body.message.should.equal( 'id is required');
      done();
    });
  });

  it('should return 500 adding user with id that is not valid', function (done) {
    api(app).post('/api/v1/users').set('cookie', cookie).send({id: 'mojo'}).expect(500, function(err, res){
      res.body.message.should.equal('id must be of the form "<username>@<domain>"');
      done();
    });
  });

  it('should return 500 adding user with id contains invalid domain', function (done) {
    api(app).post('/api/v1/users').set('cookie', cookie).send({id: 'mojo@mojo.com'}).expect(500, function(err, res){
      res.body.message.should.equal('Domain does not exist');
      done();
    });
  });

  it('should return 200 adding user with valid id', function (done) {
    api(app).post('/api/v1/users').set('cookie', cookie).send({id: 'mojo@domain.com'}).expect(200, function(err, res){
      password = res.body.password;
      done();
    });
  });

  it('should return 200 when sign admin out', function (done) {
    api(app).post('/api/v1/sign/out').set('cookie', cookie).expect(200, done);
  });


  it('should authenticate created user', function (done) {
    api(app).post('/api/v1/sign/in').send({username: 'mojo@domain.com', password: password}).expect(200, function(err, res){
      cookie = res.headers['set-cookie'];
      done();
    });
  });

  it('should sign out authenticate created user', function (done) {
    api(app).post('/api/v1/sign/out').set('cookie', cookie).expect(200, done);
  });


  it('should sign in admin', function (done) {
    api(app).post('/api/v1/sign/in').send({username: 'admin', password: 'gellatin'}).expect(200, function(err, res){
      cookie = res.headers['set-cookie'];
      done();
    });
  });


  it('should return 200 and a list of users', function (done) {
    api(app).get('/api/v1/users').set('cookie', cookie).expect(200, function(err, res){
      res.body.length.should.equal(2);
      done();
    });
  });


  it('should return 500 when updating without password', function (done) {
    api(app).put('/api/v1/users').set('cookie', cookie).send({}).expect(500, function(err, res){
      res.body.message.should.equal('password is required.');
      done();
    });
  });


  it('should return 200 when updating password', function (done) {
    api(app).put('/api/v1/users').set('cookie', cookie).send({password: 'newPassword'}).expect(200, done);
  });


  it('should return 200 when deleting user', function (done) {
    api(app).del('/api/v1/users/mojo@domain.com').set('cookie', cookie).expect(200, done);
  });
});