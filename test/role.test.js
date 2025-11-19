const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app'); // Adjust if your entry point is different

chai.should();

describe('Roles API Tests', () => {
  let token;
  let roleId;

  before((done) => {
    request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  describe('Add Role', () => {
    it('should add a new role successfully', (done) => {
      request(server)
        .post('/addRole')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Role',
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('newRole');
          roleId = res.body.newRole._id;
          done();
        });
    });

    it('should fail when role already exists', (done) => {
      request(server)
        .post('/addRole')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Role', // duplicate role
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error', 'Role already exists');
          done();
        });
    });

    it('should not add role with invalid token', (done) => {
      request(server)
        .post('/addRole')
        .set('Authorization', `Bearer invalidtoken123`)
        .send({
          name: 'Invalid Token Role',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get All Roles', () => {
    it('should fetch all roles', (done) => {
      request(server)
        .get('/getAllRoles')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.roles.should.be.a('array');
          done();
        });
    });

    it('should not fetch roles without token', (done) => {
      request(server)
        .get('/getAllRoles')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Update Role', () => {
    it('should update role successfully', (done) => {
      request(server)
        .put(`/updateRole/${roleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Test Role',
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.updatedRole.name).to.equal('Updated Test Role');
          done();
        });
    });

    it('should fail to update role if name already exists', (done) => {
      request(server)
        .put(`/updateRole/${roleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Test Role', // duplicate name
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error', 'Role already exists');
          done();
        });
    });

    it('should fail to update with invalid id', (done) => {
      request(server)
        .put('/updateRole/InvalidID123')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Should Fail Update',
        })
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          done();
        });
    });

    it('should not update role without token', (done) => {
      request(server)
        .put(`/updateRole/${roleId}`)
        .send({
          name: 'No Token Update',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Delete Role', () => {
    it('should delete role successfully', (done) => {
      request(server)
        .delete(`/deleteRole/${roleId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Role deleted successfully');
          done();
        });
    });

    it('should fail to delete role with invalid token', (done) => {
      request(server)
        .delete(`/deleteRole/${roleId}`)
        .set('Authorization', `Bearer invalidtoken123`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should fail to delete non-existent role', (done) => {
      request(server)
        .delete('/deleteRole/000000000000000000000000') // fake id
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('error', 'Role not found');
          done();
        });
    });
  });
});
