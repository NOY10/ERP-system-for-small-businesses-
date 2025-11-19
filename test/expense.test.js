const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app');

chai.should();

describe('Expense API Tests - Multiple Cases', () => {
  let token;
  let expenseId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  // ADD EXPENSE
  describe('POST /addExpense', () => {
    it('should add a valid expense', (done) => {
      request(server)
        .post('/addExpense')
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: 'Office Supplies',
          subheader: 'Stationery',
          amount: 300,
          description: 'Bought papers and pens',
          date: new Date().toISOString().split('T')[0],
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expenseId = res.body.expense._id;
          done();
        });
    });

    it('should fail if required fields are missing', (done) => {
      request(server)
        .post('/addExpense')
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: '',
          amount: 300,
          description: 'Missing subheader',
          date: new Date().toISOString().split('T')[0],
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should fail with invalid amount type', (done) => {
      request(server)
        .post('/addExpense')
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: 'Test',
          subheader: 'Invalid Amount',
          amount: 'three hundred',
          description: 'wrong type',
          date: new Date().toISOString().split('T')[0],
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  // GET ALL EXPENSES
  describe('GET /getallexpense', () => {
    it('should get all expenses with token', (done) => {
      request(server)
        .get('/getallexpense')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.expenses.should.be.a('array');
          done();
        });
    });

    it('should fail to get expenses without token', (done) => {
      request(server)
        .get('/getallexpense')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should return empty array if no expenses', (done) => {
      // Only works with a fresh DB or mocked data
      done(); // Skipped
    });
  });

  // UPDATE EXPENSE
  describe('PUT /updateExpense/:id', () => {
    it('should update an existing expense', (done) => {
      request(server)
        .put(`/updateExpense/${expenseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: 'Updated Office Supplies',
          subheader: 'Updated Stationery',
          amount: 500,
          description: 'Updated description',
          date: new Date().toISOString().split('T')[0],
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('should fail to update with invalid id', (done) => {
      request(server)
        .put(`/updateExpense/invalidid123`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: 'Fail Test',
          subheader: 'Fail',
          amount: 0,
          description: 'Invalid id',
          date: new Date().toISOString().split('T')[0],
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should fail to update without id', (done) => {
      request(server)
        .put(`/updateExpense/`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  // EXPENSE SUMMARY
  describe('GET /expenseSummary', () => {
    it('should get expense summary with token', (done) => {
      request(server)
        .get('/expenseSummary')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.should.have.property('totalOutstanding');
          done();
        });
    });

    it('should fail without token', (done) => {
      request(server)
        .get('/expenseSummary')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  // DELETE EXPENSE
  describe('DELETE /deleteExpense', () => {
    it('should delete an expense by id', (done) => {
      request(server)
        .delete('/deleteExpense')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [expenseId] })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.message.should.equal('Expenses deleted successfully');
          done();
        });
    });

    it('should fail to delete non-existent id', (done) => {
      request(server)
        .delete('/deleteExpense')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: ['64405ef4d1f2035bdf700000'] })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('should fail with empty ids array', (done) => {
      request(server)
        .delete('/deleteExpense')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });
});
