
//This agent refers to PORT where program is runninng.

process.env.NODE_ENV ='test';
const chai = require('chai');
const supertest = require('supertest');
const should = chai.should();
const expect = chai.expect;
const checkUser = require('../services/auth');
const server = supertest.agent('http://localhost:3000');
const main =require('../routes/user.js');

//-----------------------------------GET------------------------------------------

describe("GET Test",function(){


    it("Wrong API request --> 404",function(done){
        server
        .get('/v1/user')
        .expect("Content-type",/json/)
        .expect(404)
        .end(function(err,res){
            res.status.should.equal(404);
            done();
        });
    });

    it('Unauthorized User --> 401 : Unauthorized ',(done) => {
        server.get('/v1/user/self')
        .send({password :'Cloud@123',username :'cloud200@gmail.com'})     // enter URL for GET
        .expect("Content-type",/json/)
        .expect(401)
        .end(function(err,res){
            res.status.should.equal(401);
            done();
        });
    });

});

//--------------------------Invalid URL----------------------------------
describe('Basic URL Test', () => {

    it("should return 404",function(done){
        server
        .get("/user")
        .expect(404)
        .end(function(err,res){
            res.status.should.equal(404);
            done();
        });
    });
});

//-------------------------------PUT---------------------------------------------

describe('PUT request', () => {

    it('Update Invalid User Details --> 400 : BAD request',(done) => {
        server.put('/v1/user/self')     // enter URL for PUT
        .expect("Content-type",/json/)
        .expect(400)
        .end(function(err,res){
            res.status.should.equal(400);
            done();
        });
    });

    it('Unauthorized User --> 401 : Unauthorized ',(done) => {
        server.put('/v1/user/self')
        .send({password :'Cloud@123',email_address :'cloud5@gmail.com'})     // enter URL for PUT
        .expect("Content-type",/json/)
        .expect(401)
        .end(function(err,res){
            res.status.should.equal(401);
            done();
        });
    });
});
