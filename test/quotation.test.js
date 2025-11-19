const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app');

chai.should();

describe('Quotation API Tests', () => {
  let token;
  let quotationId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  describe('Add Quotation', () => {
    it('should add a new quotation successfully', (done) => {
      request(server)
        .post('/addQuotation')
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'Customer A',
          title: 'Quotation for services',
          quotationItems: [
            { description: 'Service 1', quantity: 2, price: 100 },
            { description: 'Service 2', quantity: 1, price: 200 },
          ],
          date: new Date(),
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('quotation');
          quotationId = res.body.quotation._id;
          done();
        });
    });

    it('should not add a quotation without required fields', (done) => {
      request(server)
        .post('/addQuotation')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Missing To Field' }) // missing "to" and "quotationItems"
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should fail to add quotation with invalid token', (done) => {
      request(server)
        .post('/addQuotation')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({
          to: 'Customer B',
          title: 'Invalid token test',
          quotationItems: [{ description: 'Item', quantity: 1, price: 100 }],
          date: new Date(),
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail if quotationItems is empty', (done) => {
      request(server)
        .post('/addQuotation')
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'Customer C',
          title: 'Empty Items Test',
          quotationItems: [],
          date: new Date(),
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  describe('Get All Quotations', () => {
    it('should fetch all quotations', (done) => {
      request(server)
        .get('/getallQuotation')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('quotation');
          res.body.quotation.should.be.a('array');
          done();
        });
    });

    it('should not fetch quotations without token', (done) => {
      request(server)
        .get('/getallQuotation')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should return empty array if no quotations exist', (done) => {
      request(server)
        .get('/getallQuotation')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          if (res.body.quotation.length === 0) {
            res.body.quotation.should.be.an('array').that.is.empty;
          }
          done();
        });
    });
  });

  describe('Update Quotation', () => {
    it('should update a quotation by id', (done) => {
      request(server)
        .put(`/updateQuotation/${quotationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'Updated Customer',
          title: 'Updated Quotation Title',
          quotationItems: [
            { description: 'Updated Service', quantity: 3, price: 150 },
          ],
          date: new Date(),
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('quotation');
          expect(res.body.quotation.to).to.equal('Updated Customer');
          done();
        });
    });

    it('should not update quotation with invalid id', (done) => {
      request(server)
        .put(`/updateQuotation/InvalidID123`)
        .set('Authorization', `Bearer ${token}`)
        .send({ to: 'Should Fail' })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not update quotation without token', (done) => {
      request(server)
        .put(`/updateQuotation/${quotationId}`)
        .send({
          to: 'No Token',
          title: 'No Token Update',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail update when quotationItems format is wrong', (done) => {
      request(server)
        .put(`/updateQuotation/${quotationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'Bad Format',
          quotationItems: 'shouldBeArray', // wrong type
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  describe('Search Quotation', () => {
    it('should find quotations by title or to field', (done) => {
      request(server)
        .post('/search-quotation') 
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'Updated' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('quotations');
          res.body.quotations.should.be.a('array');
          done();
        });
    });
  
    it('should return empty array when no matching quotation found', (done) => {
      request(server)
        .post('/search-quotation') 
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'NonExistingTitle' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.quotations.should.be.an('array').that.is.empty;
          done();
        });
    });
  
    it('should not search without token', (done) => {
      request(server)
        .post('/search-quotation') 
        .send({ query: 'Updated' })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  
    it('should fail if query is missing', (done) => {
      request(server)
        .post('/search-quotation') 
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });
  

  describe('Delete Quotation', () => {
    it('should delete a quotation successfully', (done) => {
      request(server)
        .delete('/deleteQuotation')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [quotationId] })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Quotations deleted successfully');
          done();
        });
    });

    it('should not delete quotation without providing ids', (done) => {
      request(server)
        .delete('/deleteQuotation')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not delete with invalid token', (done) => {
      request(server)
        .delete('/deleteQuotation')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({ ids: [quotationId] })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail when ids array is empty', (done) => {
      request(server)
        .delete('/deleteQuotation')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });
});
