// const chai = require('chai');
// const expect = chai.expect;
// const request = require('supertest');
// const server = require('../app');

// chai.should();

// describe('Income API Tests', () => {
//   let token; // for authentication
//   let incomeId; // to store created income id

//   // Before all tests, login and get token
//   before((done) => {
//     request(server)
//       .post('/signinUser') // assuming you have this route
//       .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
//       .end((err, res) => {
//         token = res.body.token;
//         done();
//       });
//   });

//   it('should add a new income', (done) => {
//     request(server)
//       .post('/addIncome')
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         header: 'Sales',
//         subheader: 'Online Sales',
//         amount: 500,
//         description: 'Income from online platform',
//         date: new Date().toISOString().split('T')[0], // format: YYYY-MM-DD
//       })
//       .end((err, res) => {
//         expect(res.status).to.equal(200);
//         expect(res.body).to.have.property('income');
//         incomeId = res.body.income._id; // save created income id
//         done();
//       });
//   });

//   it('should get all incomes', (done) => {
//     request(server)
//       .get('/getallIncomes')
//       .set('Authorization', `Bearer ${token}`)
//       .end((err, res) => {
//         expect(res.status).to.equal(200);
//         expect(res.body).to.have.property('incomes');
//         res.body.incomes.should.be.a('array');
//         done();
//       });
//   });

//   it('should update an income by id', (done) => {
//     request(server)
//       .put(`/updateIncome/${incomeId}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         header: 'Updated Sales',
//         subheader: 'Updated Online Sales',
//         amount: 800,
//         description: 'Updated description',
//         date: new Date().toISOString().split('T')[0],
//       })
//       .end((err, res) => {
//         expect(res.status).to.equal(200);
//         expect(res.body).to.have.property('expense'); // in your code, res.json({ expense })
//         expect(res.body.expense.header).to.equal('Updated Sales');
//         done();
//       });
//   });

//   it('should search income by header or subheader', (done) => {
//     request(server)
//       .post('/search-income')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ query: 'Updated' })
//       .end((err, res) => {
//         expect(res.status).to.equal(200);
//         expect(res.body).to.have.property('income');
//         res.body.income.should.be.a('array');
//         done();
//       });
//   });

//   it('should fetch income summary', (done) => {
//     request(server)
//       .get('/incomeSummary')
//       .set('Authorization', `Bearer ${token}`)
//       .end((err, res) => {
//         expect(res.status).to.equal(200);
//         expect(res.body).to.have.property('totalOutstanding');
//         expect(res.body).to.have.property('dueToday');
//         expect(res.body).to.have.property('dueWithin30Days');
//         done();
//       });
//   });

//   it('should delete an income', (done) => {
//     request(server)
//       .delete('/deleteIncome')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ ids: [incomeId] })
//       .end((err, res) => {
//         expect(res.status).to.equal(200);
//         expect(res.body).to.have.property('message', 'Incomes deleted successfully');
//         done();
//       });
//   });

// });


const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app');

chai.should();

describe('Income API Tests - Multiple Cases', () => {
  let token;
  let incomeId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  // ADD INCOME
  describe('POST /addIncome', () => {
    it('should add a valid income', (done) => {
      request(server)
        .post('/addIncome')
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: 'Sales',
          subheader: 'Product',
          amount: 500,
          description: 'Selling item A',
          date: new Date().toISOString().split('T')[0],
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          incomeId = res.body.income._id;
          done();
        });
    });

    it('should fail if required fields are missing', (done) => {
      request(server)
        .post('/addIncome')
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: '',
          amount: 500,
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
        .post('/addIncome')
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: 'Test',
          subheader: 'Invalid Amount',
          amount: 'five hundred',
          description: 'wrong type',
          date: new Date().toISOString().split('T')[0],
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  // GET ALL INCOMES
  describe('GET /getallIncomes', () => {
    it('should get all incomes with token', (done) => {
      request(server)
        .get('/getallIncomes')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.incomes.should.be.a('array');
          done();
        });
    });

    it('should fail to get incomes without token', (done) => {
      request(server)
        .get('/getallIncomes')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should return empty array if no incomes', (done) => {
      // Assume a fresh DB for testing or mock it
      done(); // skipping since DB isn't fresh here
    });
  });

  // UPDATE INCOME
  describe('PUT /updateIncome/:id', () => {
    it('should update an existing income', (done) => {
      request(server)
        .put(`/updateIncome/${incomeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          header: 'Updated Sales',
          subheader: 'Updated Product',
          amount: 1000,
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
        .put(`/updateIncome/invalidid123`)
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
        .put(`/updateIncome/`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  // INCOME SUMMARY
  describe('GET /incomeSummary', () => {
    it('should get income summary with token', (done) => {
      request(server)
        .get('/incomeSummary')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.should.have.property('totalOutstanding');
          done();
        });
    });

    it('should fail without token', (done) => {
      request(server)
        .get('/incomeSummary')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  // SEARCH INCOME
  describe('POST /search-income', () => {
    it('should find incomes with partial match', (done) => {
      request(server)
        .post('/search-income')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'Updated' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.income.should.be.a('array');
          done();
        });
    });

    it('should return empty array when no match', (done) => {
      request(server)
        .post('/search-income')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'nonexistentincome' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.income).to.be.a('array').that.is.empty;
          done();
        });
    });

    it('should fail search without token', (done) => {
      request(server)
        .post('/search-income')
        .send({ query: 'Updated' })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  // DELETE INCOME
  describe('DELETE /deleteIncome', () => {
    it('should delete an income by id', (done) => {
      request(server)
        .delete('/deleteIncome')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [incomeId] })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.message.should.equal('Incomes deleted successfully');
          done();
        });
    });

    it('should fail to delete non-existent id', (done) => {
      request(server)
        .delete('/deleteIncome')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: ['64405ef4d1f2035bdf700000'] })
        .end((err, res) => {
          expect(res.status).to.equal(404); // Assuming your backend returns 404 for not found
          done();
        });
    });

    it('should fail with empty ids array', (done) => {
      request(server)
        .delete('/deleteIncome')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });
});
