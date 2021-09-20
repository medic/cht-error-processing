const index = require('index.js');
var chaiHttp = require('chai-http');
var expect = chai.expect;

// Tell chai to use chai-http
chai.use(chaiHttp);
describe('Apm Connection', function() {
    it("connects to ElasticSearch", function() {
        return chai.request('https://localhost:8200')
            .get("")
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('query');
                expect(res.body.query).to.have.property('results');
                expect(res.body.query.results).to.be.instanceof(Object);
        });
    });
    it("connects to APM", function() {
        return chai.request('https://localhost:8200')
            .get("")
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('query');
                expect(res.body.query).to.have.property('results');
                expect(res.body.query.results).to.be.instanceof(Object);
        });
    });
});