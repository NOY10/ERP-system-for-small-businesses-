const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app'); // Adjust path if different

chai.should();

describe('Company Info API Tests', () => {
  let ownerToken;
  let employeeToken;

  before((done) => {
    // Login as Owner
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        ownerToken = res.body.token;
        // Login as Employee after owner login
        request(server)
          .post('/signinUser')
          .send({ email: 'employee@test.com', password: '123o' }) // Adjust employee test user
          .end((err, res) => {
            employeeToken = res.body.token;
            done();
          });
      });
  });

  describe('Add Company Info', () => {
    it('should add company info successfully (owner only)', (done) => {
      request(server)
        .post('/addCompanyInfo')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Company',
          established: '2020',
          regNo: 'REG123',
          logo: 'logo.png',
          address: 'Test Address',
          dzongkhag: 'Thimphu',
          phone: '12345678',
          email: 'test@company.com',
          website: 'https://testcompany.com',
          fiscalYear: '2024-2025',
        })
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('companyInfo');
          done();
        });
    });

    // it('should fail if non-owner tries to add company info', (done) => {
    //   request(server)
    //     .post('/addCompanyInfo')
    //     .set('Authorization', `Bearer ${employeeToken}`)
    //     .send({
    //       name: 'Invalid Company',
    //     })
    //     .end((err, res) => {
    //       expect(res.status).to.equal(403);
    //       expect(res.body).to.have.property('error', 'Only owners can add company info');
    //       done();
    //     });
    // });

    it('should fail if company name is missing', (done) => {
      request(server)
        .post('/addCompanyInfo')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          established: '2021',
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error', 'Company name is required');
          done();
        });
    });
  });

  describe('View Company Info (Owner)', () => {
    it('should fetch company info for logged-in owner', (done) => {
      request(server)
        .get('/viewCompanyInfo')
        .set('Authorization', `Bearer ${ownerToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('companyInfo');
          res.body.companyInfo.should.have.property('name');
          done();
        });
    });

    it('should fail to fetch without token', (done) => {
      request(server)
        .get('/viewCompanyInfo')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

//   describe('View Company Info (Employee)', () => {
//         it('should fetch company info for employee', (done) => {
//         request(server)
//             .get('/employee/viewCompanyInfo')
//             .set('Authorization', `Bearer ${employeeToken}`)
//             .end((err, res) => {
//             expect(res.status).to.equal(200);
//             expect(res.body).to.have.property('companyInfo');
//             res.body.companyInfo.should.have.property('name');
//             res.body.companyInfo.should.have.property('logo');
//             done();
//             });
//         });

//     it('should fail if employee token is invalid', (done) => {
//       request(server)
//         .get('/employee/viewCompanyInfo')
//         .set('Authorization', `Bearer invalidtoken123`)
//         .end((err, res) => {
//           expect(res.status).to.equal(401);
//           done();
//         });
//     });
//   });

  describe('Edit Company Info', () => {
    it('should update company info successfully', (done) => {
      request(server)
        .put('/editCompanyInfo')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          phone: '98765432',
          address: 'Updated Address',
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('companyInfo');
          res.body.companyInfo.should.have.property('phone', '98765432');
          done();
        });
    });

    it('should fail update without token', (done) => {
      request(server)
        .put('/editCompanyInfo')
        .send({
          phone: '11111111',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });
});
