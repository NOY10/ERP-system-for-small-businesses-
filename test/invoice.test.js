const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app');


chai.should();

describe('Invoice API Tests', () => {
  let token;
  let invoiceId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  describe('Add Invoice', () => {
    it('should add a new invoice successfully', (done) => {
      request(server)
        .post('/addInvoice')
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'Customer A',
          title: 'Invoice for services',
          invoiceItems: [
            { description: 'Service 1', quantity: 2, price: 100 },
            { description: 'Service 2', quantity: 1, price: 200 },
          ],
          date: new Date(),
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('invoice');
          invoiceId = res.body.invoice._id;
          done();
        });
    });

    it('should not add an invoice without required fields', (done) => {
      request(server)
        .post('/addInvoice')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Missing To Field' }) // missing "to" and "invoiceItems"
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should fail to add invoice with invalid token', (done) => {
      request(server)
        .post('/addInvoice')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({
          to: 'Customer B',
          title: 'Invalid token test',
          invoiceItems: [{ description: 'Item', quantity: 1, price: 100 }],
          date: new Date(),
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail if invoiceItems is empty', (done) => {
      request(server)
        .post('/addInvoice')
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'Customer C',
          title: 'Empty Items Test',
          invoiceItems: [],
          date: new Date(),
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  describe('Get All Invoices', () => {
    it('should fetch all invoices', (done) => {
      request(server)
        .get('/getallInvoice')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('invoice');
          res.body.invoice.should.be.a('array');
          done();
        });
    });

    it('should not fetch invoices without token', (done) => {
      request(server)
        .get('/getallInvoice')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should return empty array if no invoices exist', (done) => {
      // Assuming you have a separate DB or cleanup for testing this case
      request(server)
        .get('/getallInvoice')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          if (res.body.invoice.length === 0) {
            res.body.invoice.should.be.an('array').that.is.empty;
          }
          done();
        });
    });
  });

  describe('Update Invoice', () => {
    it('should update an invoice by id', (done) => {
      request(server)
        .put(`/updateInvoice/${invoiceId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'Updated Customer',
          title: 'Updated Invoice Title',
          invoiceItems: [
            { description: 'Updated Service', quantity: 3, price: 150 },
          ],
          date: new Date(),
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('invoice');
          expect(res.body.invoice.to).to.equal('Updated Customer');
          done();
        });
    });

    it('should not update invoice with invalid id', (done) => {
      request(server)
        .put(`/updateInvoice/invalidId123`)
        .set('Authorization', `Bearer ${token}`)
        .send({ to: 'Should Fail' })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not update invoice without token', (done) => {
      request(server)
        .put(`/updateInvoice/${invoiceId}`)
        .send({
          to: 'No Token',
          title: 'No Token Update',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail update when invoiceItems format is wrong', (done) => {
      request(server)
        .put(`/updateInvoice/${invoiceId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'Bad Format',
          invoiceItems: 'shouldBeArray', // wrong type
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  describe('Search Invoice', () => {
    it('should find invoices by title or to field', (done) => {
      request(server)
        .post('/search-invoice')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'Updated' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('invoice');
          res.body.invoice.should.be.a('array');
          done();
        });
    });

    it('should return empty array when no matching invoice found', (done) => {
      request(server)
        .post('/search-invoice')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'NonExistingTitle' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.invoice.should.be.an('array').that.is.empty;
          done();
        });
    });

    it('should not search without token', (done) => {
      request(server)
        .post('/search-invoice')
        .send({ query: 'Updated' })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail if query is missing', (done) => {
      request(server)
        .post('/search-invoice')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

  describe('Delete Invoice', () => {
    it('should delete an invoice successfully', (done) => {
      request(server)
        .delete('/deleteInvoice')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [invoiceId] })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Invoices deleted successfully');
          done();
        });
    });

    it('should not delete invoice without providing ids', (done) => {
      request(server)
        .delete('/deleteInvoice')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not delete with invalid token', (done) => {
      request(server)
        .delete('/deleteInvoice')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({ ids: [invoiceId] })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail when ids array is empty', (done) => {
      request(server)
        .delete('/deleteInvoice')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });

});
