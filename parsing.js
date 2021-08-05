const medicError = require('./medic-error.js');

function getMessage(error){
    let message = ''
    let stackString = '';
    try {
        message = error.message;
        stackString += message + '\n';
        stackString += error.file + " AT LINE (" + error.line + ")";
    } catch (error) {
    }
    return message ? {message: message, stack: stackString} : {message: "error format not recognized", stack: JSON.stringify(error)};
}

function parseLog(medicLog){
    let errorLog = {};
    let metadata = {};
    try {
        const infoSection = medicLog.info;
        console.log(infoSection);
        metadata = medicLog.meta;
        if (infoSection){
            errorLog = getMessage(infoSection);
        }
        else{
            errorLog = {message: 'no info section on log', stack: 'no info section on log'};
        }
        if(!metadata){
            metadata = {date:'N/A', version:'N/A', url:'N/A'}
        }
    } catch (error) {
    }
    finally{
        let createdError = new medicError(errorLog.message, errorLog.stack);
        return {createdError, metadata};
    }
}


module.exports = {parseLog, getMessage};


//Execption thrown in JavascriptInterface function: java.lang.SecurityException: Sending SMS message: uid 10096 no permission.SEND_SMS.
//let vr = "Uncaught TypeError in https://pih-malawi.app.medicmobile.org/medic/_design/medic/_rewrite/js/inbox.js at line 3: Cannot read property 'scrollIntoView' of undefined"
// function checkLevel(feedbackLog){
//     if(feedbackLog.level == 'error'){
//         if(typeof(feedbackLog.arguments) == 'string'){
//             console.log('that!');
//             return getMessage(feedbackLog.arguments.toString())
//         }
//         else{
//             console.log(feedbackLog.arguments);
//             return getMessage(feedbackLog.arguments[0].toString());
//         }
//     }
// }
