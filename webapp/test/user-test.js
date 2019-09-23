process.env.NODE_ENV ='test';

const expect = require('chai').expect;
const request = require('supertest');
 
const main =require('../routes/user');
const conn= require();  // db connection file

//----------------------------POST------------------------------------
describe('POST /', () => {
    before((done) => {
        conn.connect()
        .then(() => done())
        .catch((err) => done(err));
    });
    after((done) => {
        conn.close()
        .then(() => done())
        .catch((err) => done(err));
    });

    it('Create new User',(done) => {
        request(main).post('')   // enter URL for POST
        .send({first_name:'',last_name:'',password:'',email_address:''})
        .then((res)=>{
            const body=res.body;
            expect(body.to.contain.property('id'));
            expect(body.to.contain.property('firstname'));
            expect(body.to.contain.property('lastname'));
            expect(body.to.contain.property('email_address'));
            expect(body.to.contain.property('account_created'));
            expect(body.to.contain.property('account_updated'));
            done();
        })
        .catch((err)=> done(err));
    });

    it('Error Creating new User',(done) => {
        request(main).post('')   // enter URL for POST
        .send({first_name:'',last_name:'',password:'',email_address:''})
        .then((res)=>{
            const body=res.body;
            expect(body.errors.first_name.name)
            .to.equal('');
            done();
        })
        .catch((err)=> done(err));
    });
});

// -----------------------------------GET------------------------------------------


describe('GET /', () => {
    before((done) => {
        conn.connect()
        .then(() => done())
        .catch((err) => done(err));
    });
    after((done) => {
        conn.close()
        .then(() => done())
        .catch((err) => done(err));
    });

    it('Get no User details',(done) => {
        request(main).get('')   // enter URL for GET
        .send({password:'',email_address:''})
        .then((res)=>{
            const body=res.body;
            console.log(body);
            //expect(body.length).to.equal(0);
            done();
        })
        .catch((err)=> done(err));
    });

    it('Get User Details',(done) => {
        request(main).post('')   // enter URL for POST
        .send({first_name:'',last_name:'',password:'',email_address:''})
        .then((res)=>{
            request(main).get('')     // enter URL for GET
            .send({password:'',email_address:''})
            .then((res)=>{
                const body=res.body;
                expect(body.to.contain.property('id'));
                expect(body.to.contain.property('firstname'));
                expect(body.to.contain.property('lastname'));
                expect(body.to.contain.property('email_address'));
                expect(body.to.contain.property('account_created'));
                expect(body.to.contain.property('account_updated'));
                done();                 
            })
            .catch((err)=> done(err));
        });
    });

    // it('check first_name',function(){
    //     assert.isNumber(num);
    // });
    
    it('check string',(done) => {
        request(main).post('')   // enter URL for POST
        .send({first_name:'',last_name:'',password:'',email_address:''})
        .then((res)=>{
            request(main).get('')     // enter URL for GET
            .send({password:'',email_address:''})
            .then((res)=>{
                const body=res.body;
                assert.isString(body.first_name);
            });
        });
    });

    it('check string',(done) => {
        request(main).post('')   // enter URL for POST
        .send({first_name:'',last_name:'',password:'',email_address:''})
        .then((res)=>{
            request(main).get('')     // enter URL for GET
            .send({password:'',email_address:''})
            .then((res)=>{
                const body=res.body;
                assert.isString(body.last_name);
            });
        });
    });


});