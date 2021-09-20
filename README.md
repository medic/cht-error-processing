# cht-error-processing

> :warning: Work in progress. Not suitable for production yet.

Library for reporting errors from CHT feedback docs in Couchdb to Elastic APM.

Creates an Elastic APM agent and uses built in `apm.capture` error function to
report the errors to postgres. Adapted from https://github.com/medic/couch2pg.

## Example Usage

1. Clone from github
2. install dependencies
3. Run `node ./index.js http://admin:pass@localhost:5984/medic-users-meta --deployment my_deployment_name` to send data from
   your local CHT database to APM.

It is important that you make sure the deployment flag is included in your command to keep the correct sequence for the last doc uploaded to elastic. Options for the command line input also include '--changeslimit <default is 1000>' which is how many changes are pulled from couch in a given batch and '--doclimit <default is 100>' which is how many feedback docs are processed and pushed to elastic at a time.