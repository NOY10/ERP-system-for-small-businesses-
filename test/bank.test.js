const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app'); // Adjust if your entry point is different

chai.should();

describe('Bank API Tests', () => {
  let token;
  let bankId;

  before((done) => {
    // Log in to get the token
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' }) // Replace with valid credentials
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  describe('Add Bank Details', () => {
    it('should add bank details successfully as Owner', (done) => {
      request(server)
        .post('/addBankDetails')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountname: 'Test Bank',
          accountnumber: '12345678904441',
          startdate: '2025-01-01',
          enddate: '2026-01-01',
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Bank details added successfully');
          expect(res.body.bank).to.have.property('accountname', 'Test Bank');
          bankId = res.body.bank._id;
          done();
        });
    });

    it('should fail when bank account already exists', (done) => {
      request(server)
        .post('/addBankDetails')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountname: 'Test Bank',
          accountnumber: '1234567890', // Same account number
          startdate: '2025-01-01',
          enddate: '2026-01-01',
        })
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.body).to.have.property('error', 'Account number already exists for this user');
          done();
        });
    });

    it('should fail when required fields are missing', (done) => {
      request(server)
        .post('/addBankDetails')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountname: '', // Missing account name
          accountnumber: '1234567890',
        })
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.body).to.have.property('error', 'All fields are required');
          done();
        });
    });

    it('should fail to add bank details with invalid token', (done) => {
      request(server)
        .post('/addBankDetails')
        .set('Authorization', 'Bearer invalidToken123')
        .send({
          accountname: 'Test Bank',
          accountnumber: '1234567890',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get Bank Details', () => {
    it('should retrieve bank details successfully', (done) => {
      request(server)
        .get('/getBankDetails')
        .set('Authorization', `Bearer ${token}`)
        .query({ accountname: 'Test Bank' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.bankDetails.should.be.a('array');
          done();
        });
    });

    it('should fail to retrieve bank details without token', (done) => {
      request(server)
        .get('/getBankDetails')
        .query({ accountname: 'Test Bank' })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should not retrieve bank details if unauthorized', (done) => {
      request(server)
        .get('/getBankDetails')
        .set('Authorization', `Bearer invalidToken123`)
        .query({ accountname: 'Test Bank' })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });
});
