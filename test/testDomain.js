var should = require('should');
var api = require('supertest');
var app = require('../app.js').app;
var DB = require('../models/DB.js').DB;


describe('Domains', function () {
  var cookie;

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

  it('should return 200 and empty list when there are no domains', function (done) {
      api(app).get('/api/v1/domains').set('cookie', cookie).expect(200, function(err, res){
        res.body.length.should.equal(0);
        done();
      });
  });

  it('should return 500 when a domain is added with no id', function (done) {
    api(app).post('/api/v1/domains').set('cookie', cookie).send({id: ''}).expect(500, function(err, res){
      res.body.message.should.equal('id is required. id is the domain name of the domain you want to add');
      done();
    });
  });

  it('should return 500 when a domain is added with no type', function (done) {
    api(app).post('/api/v1/domains').set('cookie', cookie).send({id: 'domain@domain.com'}).expect(500, function(err, res){
      res.body.message.should.equal('type is required. The only accepted type is mailgun');
      done();
    });
  });

  it('should return 500 when a domain is added with type mailgun with no publicKey', function (done) {
    api(app).post('/api/v1/domains').set('cookie', cookie).send({id: 'domain@domain.com', type: 'mailgun'}).expect(500, function(err, res){
      res.body.message.should.equal('publicKey is required for mailgun type');
      done();
    });
  });

  it('should return 500 when a domain is added with type mailgun with no secret', function (done) {
    api(app).post('/api/v1/domains').set('cookie', cookie).send({id: 'domain@domain.com', type: 'mailgun', publicKey: 'public'}).expect(500, function(err, res){
      res.body.message.should.equal('secretKey is required for mailgun type');
      done();
    });
  });

  it('should return 200 when a domain is added with correct attributes', function (done) {
    api(app).post('/api/v1/domains')
      .set('cookie', cookie)
      .send({id: 'domain.com', type: 'mailgun', publicKey: 'public', secretKey: 'secret'})
      .expect(200, done);
  });

  it('should return 200 with list of domains', function (done) {
    api(app).get('/api/v1/domains').set('cookie', cookie).expect(200, function(err, res){
      res.body.length.should.equal(1);
      res.body[0].type.should.equal('mailgun');
      done();
    });
  });

  it('should return 500 when a domain is edited without a type', function (done) {
    api(app).put('/api/v1/domains/' + 'domain.com').set('cookie', cookie).send({type: '', publicKey: 'public'}).expect(500, function(err, res){
      res.body.message.should.equal('type is required. The only accepted type is mailgun');
      done();
    });
  });

  it('should return 500 when a domain is edited without a publickey', function (done) {
    api(app).put('/api/v1/domains/' + 'domain.com').set('cookie', cookie).send({type: 'mailgun', publicKey: ''}).expect(500, function(err, res){
      res.body.message.should.equal('publicKey is required for mailgun type');
      done();
    });
  });

  it('should return 500 when a domain is edited without a secretKey', function (done) {
    api(app).put('/api/v1/domains/' + 'domain.com').set('cookie', cookie).send({type: 'mailgun', secretKey: ''}).expect(500, function(err, res){
      res.body.message.should.equal('secretKey is required for mailgun type');
      done();
    });
  });


  it('should return 200 when a domain is edited without errors', function (done) {
    api(app).put('/api/v1/domains/' + 'domain.com').set('cookie', cookie).send({type: 'mailgun', secretKey: 'secret2'}).expect(200, done);
  });


  it('should return 200 when a domain is deleted', function (done) {
    api(app).del('/api/v1/domains/' + 'domain.com').set('cookie', cookie).expect(200, done);
  });
});