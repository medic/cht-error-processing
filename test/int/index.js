const index = require('../../index.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

// Tell chai to use chai-http
chai.use(chaiHttp);
console.log('im here now')
describe('Apm Connection', function() {
    it("connects to ElasticSearch", function() {
        return chai.request('http://localhost:8200')
            .get("/")
            .then(function(res) {
                expect(res).to.have.status(200);
        });
    });
    it("connects to APM", function() {
        return chai.request('http://localhost:8200')
            .get("/")
            .then(function(res) {
                expect(res).to.have.status(200);
        });
    });
});