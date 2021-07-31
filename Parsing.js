function getMessage(error){
    const stackFrames = error.split(';');
    let stackString = '';
    for(frame in stackFrames){
        stackString += stackFrames[frame];
        stackString += '; \n';
    }
    return {message: stackFrames[0], stack: stackString};
}

function checkLevel(feedbackLog){
    if(feedbackLog.level == 'error'){
        if(typeof(feedbackLog.arguments) == 'string'){
            console.log('that!');
            return getMessage(feedbackLog.arguments.toString())
        }
        else{
            console.log(feedbackLog.arguments);
            return getMessage(feedbackLog.arguments[0].toString());
        }
    }
}

function parseLog(medicLog){
    let generalLogs = medicLog.log;
    const errorLogs = generalLogs.map(checkLevel)
    let metadata = medicLog.meta;
    return {errorLogs, metadata};
}

module.exports = parseLog;