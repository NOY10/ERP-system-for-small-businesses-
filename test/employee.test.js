const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app');

chai.should();

describe('Employee API Tests - Multiple Cases', () => {
  let token;
  let employeeId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  // ADD EMPLOYEE
  describe('POST /addEmployee', () => {
    it('should add a valid employee', function (done) {
        this.timeout(5000);  
        request(server)
          .post('/addEmployee')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Test Employee',
            email: `test${Date.now()}@example.com`,
            gender: 'Male',
            role: 'Employee',
            subRole: 'Developer',
            department: 'IT',
            dob: '1998-05-20',
            phone: '12345678',
            cid: '12345678901',
            salary: 50000
          })
          .end((err, res) => {
            if (err) return done(err);
            try {
              expect(res.status).to.equal(200);
              employeeId = res.body.employee.employeeId;
              done();
            } catch (e) {
              done(e);
            }
          });
      });
      
      

    it('should fail to add employee with existing email', (done) => {
      request(server)
        .post('/addEmployee')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Duplicate Email',
          email: 'testduplicate@example.com', // Use an email that already exists in DB
          gender: 'Male',
          role: 'Employee',
          subRole: 'Developer',
          department: 'IT',
          dob: '1990-01-01',
          phone: '11111111',
          cid: '11111111111',
          salary: 50000
        })
        .end((err, res) => {
          expect(res.body.message).to.equal('Email Already Exists');
          done();
        });
    });

    it('should fail without token', (done) => {
      request(server)
        .post('/addEmployee')
        .send({
          name: 'No Token',
          email: `notoken${Date.now()}@example.com`,
          gender: 'Female',
          role: 'Employee',
          department: 'HR',
          dob: '1995-02-15',
          phone: '98765432',
          cid: '22222222222',
          salary: 30000
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  // GET ALL EMPLOYEES
  describe('GET /getallEmployees', () => {
    it('should get all employees with token', (done) => {
      request(server)
        .get('/getallEmployees')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.employees.should.be.a('array');
          done();
        });
    });

    it('should fail to get employees without token', (done) => {
      request(server)
        .get('/getallEmployees')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  // GET SINGLE EMPLOYEE
  describe('GET /getSingleEmployee/:employeeId', () => {
    it('should get a valid employee', (done) => {
      request(server)
        .get(`/getSingleEmployee/${employeeId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.employee.should.have.property('name');
          done();
        });
    });

    it('should fail for non-existing employee', (done) => {
      request(server)
        .get('/getSingleEmployee/9999999')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
  });

  // UPDATE EMPLOYEE
  describe('PUT /updateEmployee/:employeeId', () => {
    it('should update an existing employee', (done) => {
      request(server)
        .put(`/updateEmployee/${employeeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          phone: '87654321',
          salary: 60000
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.updatedEmployee.name.should.equal('Updated Name');
          done();
        });
    });

    it('should fail to update non-existing employee', (done) => {
      request(server)
        .put('/updateEmployee/9999999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Fail Update'
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('should fail without token', (done) => {
      request(server)
        .put(`/updateEmployee/${employeeId}`)
        .send({
          name: 'No Token Update'
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  // DELETE EMPLOYEE
  describe('DELETE /deleteEmployee/:employeeId', () => {
    it('should delete an existing employee', (done) => {
      request(server)
        .delete(`/deleteEmployee/${employeeId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('should fail to delete non-existing employee', (done) => {
      request(server)
        .delete('/deleteEmployee/9999999')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('should fail to delete without token', (done) => {
      request(server)
        .delete(`/deleteEmployee/${employeeId}`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });
});
