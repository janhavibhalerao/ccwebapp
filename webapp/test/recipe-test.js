process.env.NODE_ENV ='test';
const expect = require('chai').expect;
const supertest = require('supertest');
const should = require("should");
const request = require('request');
const mysql = require('../services/db');
const checkUser = require('../services/auth');
var server = supertest.agent("http://localhost:3000");
const main =require('../routes/recipe.js');


//------------------------------GET-------------------------------------
describe('get() recepie', ()=>{
   

    it("should not return recepie", (done)=>{
        server.get('/v1/recipie/a236b214-e585-11e9-b3b2-142c9f9e3222')         // provide invalid id
        .expect("Content-type",/json/)
        .expect(400)
        .end((err,res)=>{
            // const body=res.body;
            // console.log(body);
            res.status.should.equal(400);
            done();
        });
    });

    // it("should return recepie", (done)=>{
    //     server.get('/v1/recipie/c9b2bd10-e585-11e9-b3b2-142c9f9c3222') //provide valid id
    //     .expect("Content-type",/json/)
    //     .expect(200)
    //     .end((err,res)=>{
    //         const body=res.body;
    //         console.log(body);
    //         expect(body).to.contain.property('created_ts');
    //         expect(body).to.contain.property('updated_ts');
    //         expect(body).to.contain.property('ingredients');
    //         expect(body).to.contain.property('steps');
    //         expect(body).to.contain.property('nutrition_information');
    //         res.status.should.equal(200);
    //         done();
    //     });
    // });
});

//----------------------------POST---------------------------------------
describe("post Test",function(){

    it('should not allow to post recipie',(done) => {
        server.post('/v1/recipie',checkUser.authenticate)
        .send({password :'Cloud@123',username :'cloud200@gmail.com'})     // enter URL for GET
        .expect("Content-type",/json/)
        .expect(401)
        .end(function(err,res){
            res.status.should.equal(401);
            done();
        });
    });
});

//----------------------------delete------------------------
describe("delete Test",function(){

    it('should not allow to delete recipie',(done) => {
        server.delete('/v1/recipie/',checkUser.authenticate)
        .send({password :'Cloud@123',username :'cloud200@gmail.com'})     // enter URL for GET
        .expect("Content-type",/json/)
        .expect(404)
        .end(function(err,res){
            res.status.should.equal(404);
            done();
        });
    });
});

//----------------------------put------------------------
describe("put Test",function(){

    it('should not allow to update recipie',(done) => {
        server.put('/v1/recipie/',checkUser.authenticate)
        .send({password :'Cloud@123',username :'cloud200@gmail.com'})     // enter URL for GET
        .expect("Content-type",/json/)
        .expect(404)
        .end(function(err,res){
            res.status.should.equal(404);
            done();
        });
    });
});
