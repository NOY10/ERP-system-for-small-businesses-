const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app'); // Adjust if your entry point is different

chai.should();

describe('Departments API Tests', () => {
  let token;
  let deptId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  describe('Add Department', () => {
    it('should add a new department successfully', (done) => {
      request(server)
        .post('/addDept')
        .set('Authorization', `Bearer ${token}`)
        .send({
          deptName: 'Test Department',
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('newdeptName');
          deptId = res.body.newdeptName._id;
          done();
        });
    });

    it('should fail when department already exists', (done) => {
      request(server)
        .post('/addDept')
        .set('Authorization', `Bearer ${token}`)
        .send({
          deptName: 'Test Department', // duplicate
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error', 'Dept already exists');
          done();
        });
    });

    it('should not add department with invalid token', (done) => {
      request(server)
        .post('/addDept')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({
          deptName: 'Invalid Dept',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get All Departments', () => {
    it('should fetch all departments', (done) => {
      request(server)
        .get('/getAllDepartments')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.departments.should.be.a('array');
          done();
        });
    });

    it('should not fetch departments without token', (done) => {
      request(server)
        .get('/getAllDepartments')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Update Department', () => {
    it('should update department successfully', (done) => {
      request(server)
        .put(`/updateDept/${deptId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          deptName: 'Updated Test Department',
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.updatedDept.deptName).to.equal('Updated Test Department');
          done();
        });
    });

    it('should fail to update department if name already exists', (done) => {
      request(server)
        .put(`/updateDept/${deptId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          deptName: 'Updated Test Department', // duplicate name
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error', 'Dept already exists');
          done();
        });
    });

    it('should fail to update with invalid id', (done) => {
      request(server)
        .put('/updateDept/InvalidID123')
        .set('Authorization', `Bearer ${token}`)
        .send({
          deptName: 'Should Fail Update',
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not update department without token', (done) => {
      request(server)
        .put(`/updateDept/${deptId}`)
        .send({
          deptName: 'No Token Update',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Delete Department', () => {
    it('should delete department successfully', (done) => {
      request(server)
        .delete(`/deleteDept/${deptId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Dept deleted successfully');
          done();
        });
    });

    it('should fail to delete department with invalid token', (done) => {
      request(server)
        .delete(`/deleteDept/${deptId}`)
        .set('Authorization', `Bearer invalidtoken123`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail to delete non-existent department', (done) => {
      request(server)
        .delete('/deleteDept/000000000000000000000000') // fake id
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('error', 'Dept not found');
          done();
        });
    });
  });
});
