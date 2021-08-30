const main = async () => {
  const args = require('./cli');
  let couchdb = require('./db')('https://admin:password@pih-malawi.dev.medicmobile.org/medic-users-meta');
  let apm = require('elastic-apm-node').start({
      // Override service name from package.json
      // Allowed characters: a-z, A-Z, 0-9, -, _, and space
      serviceName: '',
  
      // Use if APM Server requires a token
      secretToken: '',
  
      // Use if APM Server uses API keys for authentication
      apiKey: '',
  
      // Set custom APM Server URL (default: http://localhost:8200)
      serverUrl: args.apmUrl,
  })
  let couch2pg = require('./importer');
  
  couch2pg(
      apm,
      couchdb,
      args.couch2pgDocLimit,
      args.couch2pgChangesLimit,
      args.deployment,
      args.elasticUrl
  );
}

main();