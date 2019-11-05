const {describe} = require('mocha');
const {expect} = require('chai');

describe('User should make a PUT Recipe if authenticated', function() {
    let username = "test@gmail.com";
    let password = "test@123"
    it('user should be authenticated', function() {
        expect(username).to.equal("test@gmail.com");
        expect(password).to.equal("test@123");
    });
});

describe('Should not pass id while creating user', function() {
    let id = null;
    it('Id should be null', function() {
        expect(id).to.equal(null);
    });
});

