var should = require('should');
var api = require('supertest');
var app = require('../app.js').app;
var DB = require('../tasks/DB.js').DB;


describe('Messages', function () {
  var cookie;
  var password;

  before (function (done) {
    DB.clear(function(err, results){
      api(app).post('/api/v1/admin/init').send({password: 'gellatin'}).expect(200, function(err, res){
        api(app).post('/api/v1/sign/in').send({username: 'admin', password: 'gellatin'}).expect(200, function(err, res){
          cookie = res.headers['set-cookie'];
          api(app).post('/api/v1/domains').set('cookie', cookie)
            .send({id: 'domain.com', type: 'mailgun', publicKey: 'public', secretKey: 'secret'})
            .expect(200, function(err, res){
              api(app).post('/api/v1/users').set('cookie', cookie).send({id: 'mojo@domain.com'}).expect(200, function(err, res){
                password = res.body.password;
                api(app).post('/api/v1/sign/out').set('cookie', cookie).expect(200, function(err, res){
                  api(app).post('/api/v1/sign/in').send({username: 'mojo@domain.com', password: password}).expect(200, function(err, res){
                    cookie = res.headers['set-cookie'];
                    done();
                  });
                });
              });
            });
        });
      });
    });
  });

  after(function (done) {
    DB.clear(function(err, results){
      done();
    });
  });

  it('should return 200 and empty list of sent messages', function (done) {
    api(app).get('/api/v1/mailgun/sent')
      .set('cookie', cookie)
      .expect(200, function(err, res){
        res.body.length.should.equal(0);
        done();
      });
  });

  it('should return 200 and empty list of received messages', function (done) {
    api(app).get('/api/v1/mailgun/received')
      .set('cookie', cookie)
      .expect(200, function(err, res){
        res.body.length.should.equal(0);
        done();
      });
  });


  it('should return 500 when trying to send a message without from specified', function (done) {
    api(app).post('/api/v1/mailgun/send').set('cookie', cookie).send({}).expect(500, function(err, res){
      res.body.message.should.equal('from required');
      done();
    });
  });


  it('should return 500 when trying to send a message when from does not match the current user', function (done) {
    api(app).post('/api/v1/mailgun/send').set('cookie', cookie).send({from: 'north@west.com'}).expect(500, function(err, res){
      res.body.message.should.equal('user and message.from do not match');
      done();
    });
  });


  it('should return 200 when message is correct', function (done) {
    api(app).post('/api/v1/mailgun/send').set('cookie', cookie).send({from: 'mojo@domain.com', text:'Hello World'}).expect(200, done);
  });


  it('should return 200 and with one message sent', function (done) {
    api(app).get('/api/v1/mailgun/sent')
      .set('cookie', cookie)
      .expect(200, function(err, res){
        res.body.length.should.equal(1);
        res.body[0].from.should.equal('mojo@domain.com');
        done();
      });
  });

  it('should send message to self', function (done) {
    api(app).post('/api/v1/mailgun/inbox').set('cookie', cookie).send({from: 'mojo@domain.com', recipient: 'mojo@domain.com', text:'Hello World'}).expect(200, done);
  });

  it('should return 200 and with one message received', function (done) {
    api(app).get('/api/v1/mailgun/received')
      .set('cookie', cookie)
      .expect(200, function(err, res){
        res.body.length.should.equal(1);
        res.body[0].from.should.equal('mojo@domain.com');
        res.body[0].recipient.should.equal('mojo@domain.com');
        done();
      });
  });
});