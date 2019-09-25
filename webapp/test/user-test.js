
// // This agent refers to PORT where program is runninng.

process.env.NODE_ENV ='test';
const expect = require('chai').expect;
const supertest = require('supertest');
const should = require("should");
const request = require('request');
const mysql = require('../services/db');
var server = supertest.agent("http://localhost:3000");
const main =require('../routes/user.js');




//----------------------------POST------------------------------------
describe('POST Test', () => {
    
    it('Create new User expect code 201',(done) => {
        server.post('/v1/user')   // enter URL for POST
        .send({first_name:'cloud',last_name:'fall',password:'Cloud@123',email_address:'cloud369@gmail.com'})
        .expect("Content-type",/json/)
        .end((err,res)=>{
            const body=res.body;
            expect(body).to.contain.property('id');
            expect(body).to.contain.property('first_name');
            expect(body).to.contain.property('last_name');
            expect(body).to.contain.property('email_address');
            expect(body).to.contain.property('account_created');
            expect(body).to.contain.property('account_updated');
            res.status.should.equal(201);
            done();
        });
        //.catch((err)=> done(err));
    });
    
    it('Error Creating new User status 400',(done) => {
        server.post('/v1/user')   // enter URL for POST
        .send({first_name :'cloud',last_name :'fall',password :'Cloud@123',email_address :'cloud5@gmail.com'})
        .expect("Content-type",/json/)
        .end((err,res)=>{
            const body=res.body;
            console.log(res.body);
            res.status.should.equal(400);
            done();
        });
    });
});

// // -----------------------------------GET------------------------------------------

describe("GET Test",function(){


    it("Get Invalid User details",function(done){
        server
        .get('/v1/user')
        .expect("Content-type",/json/)
        .expect(404)
        .end(function(err,res){
            var json_body = res.body;
            var msg = json_body.error;
            var code = msg.messsage;
            expect(code).to.equal('NOT FOUND');
            done();
        });
    });

});

//--------------------------Invalid URL----------------------------------
describe('Basic URL Test', () => {

    it('Main page content',function(done){
        this.timeout(15000);
        setTimeout(done, 15000);
        request('http://localhost:3000',function(error,response,body){
            var json_body = JSON.parse(body);
            //console.log(json_body);
            var msg = json_body.error;
            //console.log(msg);
            var code = msg.messsage;
            //console.log(code);
            expect(code).to.equal('NOT FOUND');
            done();
        });
    });


    it('Invalid URL', function(done) {
        this.timeout(15000);
        setTimeout(done, 15000);
        request('http://localhost:3000/cloud@gmail.com' , function(error, response, body) {
            expect(response.statusCode).to.equal(404);
            done();
        });
    });

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

//-------------------------------Integra---------------------------------------------

// describe('POST then GET Test', () => {

//     it('Get User Details',(done) => {
//         server.post('/v1/user')   // enter URL for POST
//         .send({first_name:'',last_name:'',password:'',email_address:''})
//         .then((res)=>{
//             server.get('/v1/user')     // enter URL for GET
//             .send({password:'',email_address:''})
//             .then((res)=>{
//                 const body=res.body;
//                 expect(body.to.contain.property('id'));
//                 expect(body.to.contain.property('firstname'));
//                 expect(body.to.contain.property('lastname'));
//                 expect(body.to.contain.property('email_address'));
//                 expect(body.to.contain.property('account_created'));
//                 expect(body.to.contain.property('account_updated'));
//                 done();                 
//             })
//             .catch((err)=> done(err));
//         });
//     });
    
//     it('check string',(done) => {
//         server.post('/v1/user')   // enter URL for POST
//         .send({first_name:'',last_name:'',password:'',email_address:''})
//         .then((res)=>{
//             server.get('/v1/user')     // enter URL for GET
//             .send({password:'',email_address:''})
//             .then((res)=>{
//                 const body=res.body;
//                 assert.isString(body.first_name);
//             });
//         });
//     });


// });


//------------------ mysql connection for mocking -------------------------

// it('db.connection.connect should ...', function(done) {
//     db.connection.connect(function(err, result) {
//         if(err){
//             done(err);
//             return;
//         }
//         expect(result).to.equal("SQL CONNECT SUCCESSFUL.");
//         done();
//     });
// });
