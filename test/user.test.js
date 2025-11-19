const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../app'); // adjust if your app entry is different
const mongoose = require('mongoose');
const Owner = mongoose.model('Owner'); // assuming Owner model is registered globally

chai.should();

describe('Owner API Tests', () => {
  let token;
  let ownerId;

  // Connect and setup
  before(async function () {
    this.timeout(10000); // increase timeout to 10 seconds

    // Signin user and get token
    const res = await request(server)
      .post('/signinUser')
      .send({ email: '02210215.cst@rub.edu.bt', password: '123o' });

    token = res.body.token;
    expect(token).to.be.a('string');

    // Create a test owner
    const owner = new Owner({
      name: 'Test Owner',
      email: 'testowner@example.com',
      phone: '1234567890',
      password: 'test1234',
      gender: 'Male',
      cid: 11111111111,
      dob: new Date('1990-01-01'),
      subscription: 'Basic',
      account: 'TestAccount123',
    });

    const savedOwner = await owner.save();
    ownerId = savedOwner._id;
  });

  // Test: Get  owners by ID
  it('should fetch owner by ID', async () => {
    const res = await request(server)
      .get(`/getOwner/${ownerId}`)  // Correct path to get a specific owner
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.status).to.equal(200);
    expect(res.body.owner).to.have.property('email', 'testowner@example.com');
  });
  

 

  it('should update owner successfully', async () => {
    const res = await request(server)
      .put(`/updateOwner/${ownerId}`) 
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Owner',
        phone: '0987654321',
      });
  
    expect(res.status).to.equal(200);
    expect(res.body.updatedOwner.name).to.equal('Updated Owner');
    expect(res.body.updatedOwner.phone).to.equal('0987654321');
  });
  

  it('should delete owner successfully', async () => {
    const res = await request(server)
      .delete(`/deleteOwner/${ownerId}`)  // Make sure the URL matches
      .set('Authorization', `Bearer ${token}`)
      .send();
  
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Owner account deleted successfully');
  });
  
  // Cleanup after tests
  after(async () => {
    await Owner.deleteMany({ email: 'testowner@example.com' }); // clean test owners
  });
});
