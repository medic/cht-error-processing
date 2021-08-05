// Add this to the VERY top of the first file loaded in your app
var apm = require('elastic-apm-node').start({
    // Override service name from package.json
    // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    serviceName: '',
  
    // Use if APM Server requires a token
    secretToken: '',
  
    // Use if APM Server uses API keys for authentication
    apiKey: '',
  
    // Set custom APM Server URL (default: http://localhost:8200)
    serverUrl: '',
  })
  
let parseLog = require('./parsing.js').parseLog;

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('./output/log.jsonl')
});

lineReader.on('line', function (line) {
  if(line){
    const generalLogs = parseLog(JSON.parse(line));
    const metadata = generalLogs.metadata;
    const errorForAtm = generalLogs.createdError;
    apm.captureError(errorForAtm, {labels: {date: metadata.time, version: metadata.version, url: metadata.url}});
  }
});
