
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

    // before((done) => {
    //     mysql.createConnection()
    //     .then(() => done())
    //     .catch((err) => done(err));
    // });

    // after((done) => {
    //     conn.close()
    //     .then(() => done())
    //     .catch((err) => done(err));
    // });

    it('Create new User',(done) => {
        request(main).post('/v1/user')   // enter URL for POST
        .send({first_name:'cloud',last_name:'fall',password:'Cloud@123',email_address:'cloud@gmail.com'})
        .expect("Content-type",/json/)
        .end((err,res)=>{
            const body=res.body;
            expect(body.to.contain.property('id'));
            expect(body.to.contain.property('first_name'));
            expect(body.to.contain.property('last_name'));
            expect(body.to.contain.property('email_address'));
            expect(body.to.contain.property('account_created'));
            expect(body.to.contain.property('account_updated'));
            res.status.should.equal(201);
            done();
        })
        .catch((err)=> done(err));
    });

    it('Error Creating new User',(done) => {
        request(main).post('v1/user')   // enter URL for POST
        .send({first_name:'abc',last_name:'xyz',password:'Abc@12345',email_address:'abcxyz'})
        .expect("Content-type",/json/)
        .end((err,res)=>{
            const body=res.body;
            res.status.should.equal(400);
            done();
        })
        .catch((err)=> done(err));
    });
});

// // -----------------------------------GET------------------------------------------

describe("GET Test",function(){

    // before((done) => {
    //     mysql.createConnection()
    //     .then(() => done())
    //     .catch((err) => done(err));
    // });

    // after((done) => {
    //     conn.close()
    //     .then(() => done())
    //     .catch((err) => done(err));
    // });

    it("user authentication",function(done){
        server
        .get('/v1/user')
        .send({"email-address" : "cloud@gmail.com", "password" : "Cloud@123"})
        .expect("Content-type",/json/)
        .expect(200) // HTTP Response
        .end(function(err,res){
        res.status.should.equal(200); // HTTP status
        res.body.error.should.equal(false); // Error key
        console.log(res.body.data);
        //res.body.data.should.equal(7);
        done();
        });
    });

//     it('Get NO User details',(done) => {
//         request(main).get('')   // enter URL for GET
//         .send({password:'',email_address:''})
//         .then((res)=>{
//             const body=res.body;
//             console.log(body);
//             //expect(body.length).to.equal(0);
//             done();
//         })
//         .catch((err)=> done(err));
//     });

});


describe('Basic URL Test', () => {

    it('Main page content',function(done){
        this.timeout(15000);
        setTimeout(done, 15000);
        request('http://localhost:3000',function(error,response,body){
            //expect(body).to.equal('{"error": {"messsage": "NOT FOUND"}}');
            //body.should.have.property('error');
            console.log(body);
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
//         request(main).post('/v1/user')   // enter URL for POST
//         .send({first_name:'',last_name:'',password:'',email_address:''})
//         .then((res)=>{
//             request(main).get('/v1/user')     // enter URL for GET
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
//         request(main).post('/v1/user')   // enter URL for POST
//         .send({first_name:'',last_name:'',password:'',email_address:''})
//         .then((res)=>{
//             request(main).get('/v1/user')     // enter URL for GET
//             .send({password:'',email_address:''})
//             .then((res)=>{
//                 const body=res.body;
//                 assert.isString(body.first_name);
//             });
//         });
//     });

//     it('check string',(done) => {
//         request(main).post('/v1/user')   // enter URL for POST
//         .send({first_name:'',last_name:'',password:'',email_address:''})
//         .then((res)=>{
//             request(main).get('/v1/user')     // enter URL for GET
//             .send({password:'',email_address:''})
//             .then((res)=>{
//                 const body=res.body;
//                 assert.isString(body.last_name);
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


//----------------using chai----------------
// var chai = require('chai');
// var chaiHttp = require('chai-http');
// var server = require('../server');
// var should = chai.should();

// chai.use(chaiHttp);


// it('test POST', function(done) {
//     chai.request(server)
//       .get('/v1/user')  // enter URL for get
//       .send({"email-address" : "abc@gmail.com", "password" : "abcsd"})
//       .end(function(err, res){
//         res.should.have.status(200);
//         done();
//       });
//   });