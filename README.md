# cht-error-processing

> :warning: Work in progress. Not suitable for production yet.

Library for reporting errors from CHT feedback docs in Couchdb to Elastic APM.

Creates an Elastic APM agent and uses built in `apm.capture` error function to
report the errors to postgres. Adapted from https://github.com/medic/couch2pg.

## Example Usage

1. Clone from github
2. install dependencies
3. Run `node ./index.js http://admin:pass@localhost:5984/medic-users-meta` to send data from
   your local CHT database to APM.
