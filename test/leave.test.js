const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app');

chai.should();

describe('Leave API Tests', () => {
  let token;
  let leaveId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  describe('Add Leave', () => {
    it('should add a new leave successfully', (done) => {
        request(server)
          .post('/addLeave')
          .set('Authorization', `Bearer ${token}`)
          .send({
            leaveType: 'Casual Leave',
            reason: 'Personal work',
            startDate: '2025-05-01',
            endDate: '2025-05-03',
            days: 3, 
          })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('leave');
            leaveId = res.body.leave._id;
            done();
          });
      });

    it('should not add leave without required fields', (done) => {
      request(server)
        .post('/addLeave')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Missing dates' }) // missing type, fromDate, toDate
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should fail to add leave with invalid token', (done) => {
      request(server)
        .post('/addLeave')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({
          leaveType: 'Medical Leave',
          reason: 'Health issue',
          startDate: '2025-05-05',
          endDate: '2025-05-06',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get All Leaves', () => {
    it('should fetch all leaves', (done) => {
      request(server)
        .get('/getAllLeaves')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('leaves');
          res.body.leaves.should.be.a('array');
          done();
        });
    });

    it('should not fetch leaves without token', (done) => {
      request(server)
        .get('/getAllLeaves')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Update Leave', () => {
    it('should update a leave by id', (done) => {
      request(server)
        .put('/updateLeave')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: leaveId,
          type: 'Updated Casual Leave',
          reason: 'Updated reason',
          fromDate: '2025-05-02',
          toDate: '2025-05-04',
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('leave');
          expect(res.body.leave.type).to.equal('Updated Casual Leave');
          done();
        });
    });

    it('should not update leave with invalid id', (done) => {
      request(server)
        .put('/updateLeave')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: 'InvalidID123',
          type: 'Fail Test',
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not update leave without token', (done) => {
      request(server)
        .put('/updateLeave')
        .send({
          id: leaveId,
          type: 'No Token Update',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Delete Leave', () => {
    it('should delete a leave successfully', (done) => {
      request(server)
        .delete('/deleteLeave')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [leaveId] })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Leaves deleted successfully');
          done();
        });
    });

    it('should not delete leave without providing ids', (done) => {
      request(server)
        .delete('/deleteLeave')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not delete with invalid token', (done) => {
      request(server)
        .delete('/deleteLeave')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({ ids: [leaveId] })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail when ids array is empty', (done) => {
      request(server)
        .delete('/deleteLeave')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });
  });
});
