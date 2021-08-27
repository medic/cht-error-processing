const medicError = require('./medic-error.js');

function getMessage(infoSection){
    let messageForError = ''
    let stackString = '';
    const infoKeys = Object.keys(infoSection);
    if (infoKeys.includes('cause')){
        messageForError = infoSection.cause;
        stackString += messageForError + '\n';
    }
    if (infoKeys.includes('message')){
        if(!messageForError){
            messageForError = infoSection.message;
        }
        stackString += infoSection.message + '\n';
    }
    if (infoKeys.includes('file') && infoKeys.includes('line')){
        stackString += infoSection.file + " AT LINE (" + infoSection.line + ")";
    }
    return messageForError ? {message: messageForError, stack: stackString} : {message: JSON.stringify(infoSection), stack: JSON.stringify(infoSection)};
}

function parseLog(medicLog){
    let errorLog = {};
    let metadata = {};
    const logKeys = Object.keys(medicLog);
    if(logKeys.includes('info')){
        errorLog = getMessage(medicLog.info);
    }
    else{
        errorLog = {message: 'no info section on log', stack: 'no info section on log'};
    }
    if(logKeys.includes('meta')){
        metadata = medicLog.meta;
    }
    else{
        metadata = {date:'N/A', version:'N/A', url:'N/A'};
    }
    let createdError = new medicError(errorLog.message, errorLog.stack);
    return {errorForApm: createdError, metadata};
}

module.exports = {parseLog, getMessage};
