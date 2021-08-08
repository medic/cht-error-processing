const { parseLog } = require('./parsing');

const main = async () => {
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

//let parseLog = require('./parsing.js').parseLog;

const feedbackData = require('./feedbackData');
const feedbackRecords = await feedbackData.fetchAllRows(process.argv[2]);
  feedbackRecords
  .rows
  .map((fr)=> fr.doc)
  .map(parseLog)
  .map((doc)=>{
    const {errorForApm, metadata} = doc;
    const apmLabels = {labels: {date: metadata.time, version: metadata.version, url: metadata.url}};
    return {errorForApm, apmLabels};
  })
  .forEach(({errorForApm, apmLabels})=>{
    apm.captureError(errorForApm, apmLabels);
  })
}

main();