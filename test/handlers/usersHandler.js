const mongoose = require('mongoose')
const request = require('supertest');
const factory = require('factory-girl').factory
const expect = require('chai').expect;
const sinon = require('sinon');

require('sinon-as-promised')

describe('UsersHandler', () => {
  describe('POST /api/users/authenticate', () => {
    let validUser = null;
    let password = "testpassword";
    let server;

    before(async () => {
      server = require('../../server');
      // Create valid user
      validUser = await factory.create('user', { password })
    })


    it('responds with error if user does not exist', (done) => {
      request(server)
        .post('/api/users/authenticate')
        .send({
          email: 'notregistered@email.com',
          password: 'testtest'
        })
        .end((err, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with error if get error from mongo', (done) => {
      let stub = sinon.stub(mongoose.Model, 'findOne').rejects(new Error('Oops'))
      request(server)
        .post('/api/users/authenticate')
        .send({
          email: 'notregistered@email.com',
          password: 'testtest'
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, response) => {
          stub.restore();
          expect(response.body.code).to.equal(1000101);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done()
        })
    });

    it('responds with error if user password is wrong', (done) => {
      request(server)
        .post('/api/users/authenticate')
        .send({
          email: validUser.email,
          password: 'invalid'
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000100);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with token and user info if login success', async () => {
      // Set active flag as true
      const user = await factory.create('user', { password: password, active: true })
      const response = await request(server)
        .post('/api/users/authenticate')
        .send({
          email: user.email,
          password: password
        })
      expect(response.body.token).to.exist;
      expect(response.body.user).to.exist;
      expect(response.body.user.email).to.equal(user.email);
      expect(response.body.user.firstname).to.equal(user.firstname);
      expect(response.body.user.lastname).to.equal(user.lastname);
      expect(response.body.user._id).to.equal(String(user._id));
    });

  });

  describe('POST /api/users', () => {
    let validUser = null;
    let password = "testpassword";
    let server;

    before(async () => {
      server = require('../../server');
      // Create valid user
      validUser = await factory.create('user', { password })
    })


    it('responds with error if email exist', async () => {
      const response = await request(server)
        .post('/api/users')
        .send({
          email: validUser.email,
          password: 'testtest',
          firstname: 'James',
          lastname: 'Doe'
        })
      expect(response.status).to.equal(409)
      expect(response.body.code).to.equal(1000001);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.contains('email');
    })

    it('responds with error if some validation fails', async () => {
      const response = await request(server)
        .post('/api/users')
        .send({
          email: "invalidemail",
          password: 'testtest',
          firstname: 'James',
          lastname: 'Doe'
        })
      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal(1000000)
      expect(response.body.message).to.exist
      expect(response.body.detail).to.exist
      expect(response.body.errors).to.contains('email')
    });

    it('responds with success if the user was created', async () => {
      const user = await factory.build('user')
      const response = await request(server)
        .post('/api/users')
        .send({
          email: user.email,
          password: user.password,
          firstname: user.firstname,
          lastname: user.lastname
        })
      expect(response.status).to.equal(201)
      expect(response.body.message).to.exist
      expect(response.body.user).to.exist
      expect(response.body.user._id).to.exist
      expect(response.body.user.email).to.equal(user.email)
    });

  });
});
