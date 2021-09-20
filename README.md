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

There is also '--fromSeq <default is 'now'>' this is only used if the deployment you entered for the deployment flag does not yet exist in elasticSearch. The value defaults to 'now' which starts the sync at the most recent sequence. This means that no docs will be uploaded to elastic on the first run of the code, but the next time that you run it, any new docs will get uploaded to elasticAPM provided there are new docs in couch since you last ran it. If set to 0, the program will loop and sync all of the docs that exist in the database starting from the oldest one. This value can be set to an existing sequence in the changes feed as well, but that feed will likely have to be manually chosen.