const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app'); // adjust if your entry point is different

chai.should();

describe('Account API Tests', () => {
  let token;
  let accountId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  describe('Add Account', () => {
    it('should add a new account successfully', (done) => {
      request(server)
        .post('/addAccount')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 1001,
          name: 'Sales Account',
          type: 'Revenue',
          taxRate: 5,
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('account');
          accountId = res.body.account._id;
          done();
        });
    });

    it('should fail when code is invalid', (done) => {
      request(server)
        .post('/addAccount')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'abc', // invalid code
          name: 'Invalid Account',
          type: 'Expense',
          taxRate: 5,
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });

    it('should fail when taxRate is invalid', (done) => {
      request(server)
        .post('/addAccount')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 1002,
          name: 'Another Account',
          type: 'Asset',
          taxRate: 'wrong', // invalid taxRate
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });

    it('should not add account with invalid token', (done) => {
      request(server)
        .post('/addAccount')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({
          code: 1003,
          name: 'Invalid Token Account',
          type: 'Liability',
          taxRate: 7,
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get All Accounts', () => {
    it('should fetch all accounts', (done) => {
      request(server)
        .get('/getAllAccounts')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.accounts.should.be.a('array');
          done();
        });
    });

    it('should not fetch accounts without token', (done) => {
      request(server)
        .get('/getAllAccounts')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get Accounts By Type', () => {
    it('should fetch accounts of type Revenue', (done) => {
      request(server)
        .get('/getAccountsByType?type=Revenue')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.accounts.should.be.a('array');
          done();
        });
    });

    it('should return empty array if type does not exist', (done) => {
      request(server)
        .get('/getAccountsByType?type=NonExistentType')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.accounts.should.be.an('array').that.is.empty;
          done();
        });
    });

    it('should not fetch accounts by type without token', (done) => {
      request(server)
        .get('/getAccountsByType?type=Revenue')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Update Account', () => {
    it('should update account successfully', (done) => {
      request(server)
        .put('/updateAccount')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: accountId,
          code: 2001,
          name: 'Updated Account',
          type: 'Expense',
          taxRate: 10,
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.account.name).to.equal('Updated Account');
          done();
        });
    });

    it('should fail to update with invalid id', (done) => {
      request(server)
        .put('/updateAccount')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: 'InvalidID123',
          code: 3001,
          name: 'Should Fail',
          type: 'Asset',
          taxRate: 8,
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not update account without token', (done) => {
      request(server)
        .put('/updateAccount')
        .send({
          id: accountId,
          name: 'No Token Update',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Delete Account', () => {
    it('should delete account successfully', (done) => {
      request(server)
        .delete('/deleteAccount')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [accountId] })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Accounts deleted successfully');
          done();
        });
    });

    it('should fail to delete account with invalid token', (done) => {
      request(server)
        .delete('/deleteAccount')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({ ids: [accountId] })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail when ids array is empty', (done) => {
      request(server)
        .delete('/deleteAccount')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });

    it('should fail when ids are missing', (done) => {
      request(server)
        .delete('/deleteAccount')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });
  });
});
