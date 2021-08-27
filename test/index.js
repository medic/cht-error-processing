const parsing = require('../parsing.js');
const acceptableError = require('./acceptable-error.json');
const misformattedError = require('./misformatted-error.json');
const noInfoError = require('./no-info-error.json');
const medicError = require('../medic-error.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
// Tell chai to use chai-http
chai.use(chaiHttp);
describe('ATM Connection', function() {
    it("connects to APM", function() {
        return chai.request('https://query.yahooapis.com')
            .get("")
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('query');
                expect(res.body.query).to.have.property('results');
                expect(res.body.query.results).to.be.instanceof(Object);
        });
    });
});

describe('parsing.js', ()=>{
    describe('getMessage', ()=>{
        const getMessageAcceptableError = parsing.getMessage(acceptableError.info);
        it('should parse the correct message from an acceptable error input', ()=>{
            expect(getMessageAcceptableError.message).to.equal("Uncaught Error: Could not resolve 'undefined' from state 'home'");
        })
        it('should parse the correct stack from an acceptable error input', ()=>{
           expect(getMessageAcceptableError.stack).to.equal("Uncaught Error: Could not resolve \'undefined\' from state \'home\'\nhttps://muso-mali.app.medicmobile.org/medic/_design/medic/_rewrite/js/inbox.js AT LINE (3)");
        })
        const getMessageMisformattedError = parsing.getMessage(misformattedError.info);
        it('should handle an unrecognized error input', ()=>{
            expect(getMessageMisformattedError.message).to.equal('"0"');
            expect(getMessageMisformattedError.stack).to.equal('"0"');
        })
    });

    describe('parseLog', ()=>{
        describe('accepted input', ()=>{
            const parsedAcceptableError = parsing.parseLog(acceptableError);
            it('should have correct message and stack values in errorLog for accepted input', ()=>{
                expect(parsedAcceptableError.createdError.message).to.equal("Uncaught Error: Could not resolve 'undefined' from state 'home'");
                expect(parsedAcceptableError.createdError.stack).to.equal("Uncaught Error: Could not resolve \'undefined\' from state \'home\'\nhttps://muso-mali.app.medicmobile.org/medic/_design/medic/_rewrite/js/inbox.js AT LINE (3)");
            })
            it('should have correct metadata info for accepted input', ()=>{
                expect(parsedAcceptableError.metadata).to.eql({"url": "https://muso-mali.app.medicmobile.org/medic/_design/medic/_rewrite/#/home", "time": "2019-07-22T12:55:29.163Z", "user": {"name": "user", "roles": ["district-manager"]}});
            })
        })
        describe('unexpected input', ()=>{
            const  parsedBadInput = parsing.parseLog(noInfoError);
            let testError = new medicError('no info section on log', 'no info section on log');
            it('should handle an error with no info section', ()=> {
                expect(parsedBadInput).to.eql({createdError: testError, metadata: {"app": "medic", "url": "https://muso-mali.app.medicmobile.org/medic/_design/medic/_rewrite/#/error/", "time": "2019-07-10T12:38:36.075Z", "user": {"name": "user", "roles": ["chw_uhc"]}, "version": "3.3.0"}});
            })
        })
    })
});

// describe('index.js', ()=>{
//     const generalLogs = parsedAcceptableError = parsing.parseLog(acceptableError);
//     const errorForApm = generalLogs.createdError;
//     it('should create error with proper stack and message', ()=> {
//         assert.deepEqual(errorForApm.message, {message: "Uncaught Error: Could not resolve 'undefined' from state 'home'", stack: "Uncaught Error: Could not resolve \'undefined\' from state \'home\'\nhttps://muso-mali.app.medicmobile.org/medic/_design/medic/_rewrite/js/inbox.js AT LINE (3)"});
//     })
// });
