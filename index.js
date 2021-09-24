const main = async () => {
  const args = require('./cli')();
  let couchdb = require('./db')(args.couchdbUrl);
  let feedbackFerry = require('./importer');
  //APM CONFIGURATION
  let apm = require('elastic-apm-node').start({
      // Override service name from package.json
      // Allowed characters: a-z, A-Z, 0-9, -, _, and space
      serviceName: 'Cht-error-processing',
  
      // Use if APM Server requires a token
      secretToken: '',
  
      // Use if APM Server uses API keys for authentication
      apiKey: '',
  
      // Set custom APM Server URL (default: http://localhost:8200)
      serverUrl: 'http://localhost:8200',
  })
    

//ELASTICSEARCH NODE CONFIGURATION
  const { Client } = require('@elastic/elasticsearch')
  const elasticsearch = new Client({ node: 'http://localhost:9200' })

  return feedbackFerry(
      apm,
      couchdb,
      args.couch2pgDocLimit,
      args.couch2pgChangesLimit,
      args.deployment,
      elasticsearch,
      args.fromSeq
  );
}

main().then(() => console.log('Import finished.'));
