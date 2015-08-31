let chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require("sinon-chai");
    
let expect = chai.expect;
chai.use(sinonChai);


describe('first test', function() {
    it('should say true is true', function() {
        expect(true).to.be.true;
    });
});
