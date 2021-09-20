const parsing = require('../../parsing.js');
const acceptableError = require('../acceptable-error.json');
const misformattedError = require('../misformatted-error.json');
const noInfoError = require('../no-info-error.json');
const medicError = require('../../medic-error.js');
var chai = require('chai');
var expect = chai.expect;

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
                expect(parsedAcceptableError.errorForApm.message).to.equal("Uncaught Error: Could not resolve 'undefined' from state 'home'");
                expect(parsedAcceptableError.errorForApm.stack).to.equal("Uncaught Error: Could not resolve \'undefined\' from state \'home\'\nhttps://muso-mali.app.medicmobile.org/medic/_design/medic/_rewrite/js/inbox.js AT LINE (3)");
            })
            it('should have correct metadata info for accepted input', ()=>{
                expect(parsedAcceptableError.metadata).to.eql({"url": "https://muso-mali.app.medicmobile.org/medic/_design/medic/_rewrite/#/home", "time": "2019-07-22T12:55:29.163Z", "user": {"name": "user", "roles": ["district-manager"]}});
            })
        })
        describe('unexpected input', ()=>{
            const  parsedBadInput = parsing.parseLog(noInfoError);
            let testError = new medicError('no info section on log', 'no info section on log');
            it('should handle an error with no info section', ()=> {
                expect(parsedBadInput.errorForApm.message).to.eql(testError.message);
                expect(parsedBadInput.errorForApm.stack).to.eql(testError.stack);
                expect(parsedBadInput.metadata).to.eql({app: "medic", url: "https://muso-mali.app.medicmobile.org/medic/_design/medic/_rewrite/#/error/", time: "2019-07-10T12:38:36.075Z", user: {name: "user", roles: ["chw_uhc"]}, version: "3.3.0"});
            })
        })
    })
});
