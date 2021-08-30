# cht-error-processing

Library for reporting errors from medic feedback docs in couchdb to elasticAPM. Creates a Node elasticAPM agent and uses built in apm.capture error function to report the errors to postgres. Adapted from https://github.com/medic/couch2pg.

## Example Usage

clone from github 
install dependencies
node ./index.js http://admin:pass@localhost:5984/db
