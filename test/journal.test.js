const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app'); // adjust if your app file is elsewhere

chai.should();

describe('Journal API Tests - Multiple Cases', () => {
  let token;
  let createdJournalID;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  // ADD JOURNAL
  describe('POST /addJournal', () => {
    it('should add a valid journal entry', (done) => {
      request(server)
        .post('/addJournal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          narration: 'Test Journal Entry',
          date: new Date().toISOString().split('T')[0],
          creditTotal: 1000,
          debitTotal: 1000,
          incomes: [
            {
              header: 'Sales',
              subheader: 'Online',
              taxRate: 5,
              amount: 1000,
              description: 'Income from online sales',
            },
          ],
          expenses: [
            {
              header: 'Office Supplies',
              subheader: 'Stationery',
              taxRate: 5,
              amount: 1000,
              description: 'Bought office supplies',
            },
          ],
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.should.have.property('journalID');
          createdJournalID = res.body.journalID;
          done();
        });
    });

    it('should fail without token', (done) => {
      request(server)
        .post('/addJournal')
        .send({
          narration: 'Invalid Try',
          date: new Date().toISOString().split('T')[0],
          creditTotal: 500,
          debitTotal: 500,
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail with missing required fields', (done) => {
      request(server)
        .post('/addJournal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          narration: '',
          date: '',
          creditTotal: null,
          debitTotal: null,
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  // GET ALL JOURNALS
  describe('GET /getAllJournals', () => {
    it('should get all journals with valid token', (done) => {
      request(server)
        .get('/getAllJournals')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.data.should.be.a('array');
          done();
        });
    });

    it('should fail to get journals without token', (done) => {
      request(server)
        .get('/getAllJournals')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  // GET BY JOURNAL ID
  describe('POST /getByJournalID', () => {
    it('should get journal by valid ID', (done) => {
      request(server)
        .post('/getByJournalID')
        .set('Authorization', `Bearer ${token}`)
        .send({ journalID: createdJournalID })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.should.have.property('narration');
          done();
        });
    });

    it('should fail with invalid journal ID format', (done) => {
      request(server)
        .post('/getByJournalID')
        .set('Authorization', `Bearer ${token}`)
        .send({ journalID: 'invalid123' })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });

    it('should fail without token', (done) => {
      request(server)
        .post('/getByJournalID')
        .send({ journalID: createdJournalID })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  // EDIT JOURNAL
  describe('PUT /editJournal', () => {
    it('should edit an existing journal', (done) => {
      request(server)
        .put('/editJournal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          journalID: createdJournalID,
          narration: 'Updated Test Journal',
          date: new Date().toISOString().split('T')[0],
          creditTotal: 2000,
          debitTotal: 2000,
          incomes: [
            {
              header: 'Updated Sales',
              subheader: 'Updated Online',
              taxRate: 10,
              amount: 2000,
              description: 'Updated income',
            },
          ],
          expenses: [
            {
              header: 'Updated Office',
              subheader: 'Updated Stationery',
              taxRate: 10,
              amount: 2000,
              description: 'Updated expense',
            },
          ],
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.should.have.property('message');
          done();
        });
    });

    it('should fail editing with invalid journal ID', (done) => {
      request(server)
        .put('/editJournal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          journalID: 'invalid123',
          narration: 'Should Fail',
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });
  });

  // DELETE JOURNAL
  describe('DELETE /deleteJournals', () => {
    it('should delete journal by ID', (done) => {
      request(server)
        .delete('/deleteJournals')
        .set('Authorization', `Bearer ${token}`)
        .send({ journalIDs: [createdJournalID] })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.should.have.property('message');
          done();
        });
    });

    it('should fail to delete with invalid IDs', (done) => {
      request(server)
        .delete('/deleteJournals')
        .set('Authorization', `Bearer ${token}`)
        .send({ journalIDs: ['invalid123'] })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });

    it('should fail to delete without token', (done) => {
      request(server)
        .delete('/deleteJournals')
        .send({ journalIDs: [createdJournalID] })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });
});
