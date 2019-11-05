const {describe} = require('mocha');
const {expect} = require('chai');

describe('Recipe should contain cook time', function() {
    let cooktime = 10;
    it('Recipe must contain valid cook time', function() {
        expect(cooktime).to.exist;
        
    });
});

describe('Recipe should not contain total prep time', function() {
    it('Recipe must not contain total prep time', function() {
        let totalTime = null;
        expect(totalTime).to.equal(null);
        
    });
});