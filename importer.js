const { parseLog } = require('./parsing');
let _ = require('underscore');
const moment = require('moment');

//Creates index of the deployment if it has yet to exist in index sequences of the id deployment.
let makeIndex = async function(elasticsearch, deployment){
  return await elasticsearch.index({
    index: 'sequences',
    id: deployment,
    body: {
      seq: '0',
    }
  })
}
//Fetches Seq of most recent doc in cahnges feed sent to elastic
let getSeq = async function(elasticsearch, deployment) {
  'use strict';
  try {
    const { body } = await elasticsearch.get({
      index: 'sequences',
      id: deployment
    })
    return body._source.seq;
  } catch (error) {
    makeIndex(elasticsearch, deployment);
    return '0';
  }
}
//Stores seq of last pushed doc to elastic
let storeSeq = async function(elasticsearch, deployment, sequence){
  'use strict';
  return await elasticsearch.update({
    index: 'sequences',
    id: deployment,
    body: {
        doc: {
          seq: sequence
        }
      }
  })
}

let emptyChangesSummary = function(lastSeq) {
    return {
      edited: [],
      lastSeq: lastSeq || 0
    };
}

//check of whether changes has anything in it (if not, sync is done)
let changesCount = function(changes) {
  return ((changes && changes.edited && changes.edited.length)   || 0);
};

//change date to timestamp in milliseconds for pushing to elastic
const toTimestamp = (strDate) => {  
  const dt = moment(strDate).unix();  
  return dt * 1000;  
}  

/*
apm: apm agent 
couchdb: couch database
docsToDownload: array of ids of docs to be downloaded
deployment: string of the deployment of the cht, for metadata to apm
*/
let loadAndStoreDocs = function(apm, couchdb, concurrentDocLimit, docsToDownload, deployment) {
    if (docsToDownload.length) {
      var changeSet = docsToDownload.splice(0, concurrentDocLimit);
  
      return couchdb.allDocs({
        include_docs: true,
        keys: _.pluck(changeSet, 'id')
      }).then(function(couchDbResult) {
        console.log('Pulled ' + couchDbResult.rows.length + ' results from couchdb');
        return couchDbResult;
      })
      .then(function(couchDbResult) {
        let rows = couchDbResult.rows.filter(d => d.doc.type == 'feedback');
        console.log('Inserting ' + rows.length + ' results into elasticApm');

        // couchDbResult
        // .
        
        rows
        .map((fr)=> fr.doc)
        .map(parseLog)
        .map((doc)=>{
            const {errorForApm, metadata} = doc;
            const apmLabels = {labels: {date: i, version: 'etadata.version', url: 'metadata.url', deployment: 'deployment'}, timestamp: Number(toTimestamp(metadata.date))};
            return {errorForApm, apmLabels};
        })
        .forEach(({errorForApm, apmLabels})=>{
            apm.captureError(errorForApm, apmLabels);
        });
      }).catch(function(err){
        console.log(err);
      })
      .then(function() {
            return loadAndStoreDocs(apm, couchdb, concurrentDocLimit, docsToDownload, deployment);
      });
    }
};

let importChangesBatch = function(apm, couchdb, concurrentDocLimit, changesLimit, deployment, elasticsearch) {
    getSeq(elasticsearch, deployment).catch(console.log)
    .then(function(seq){
    console.log(seq);
    });
    getSeq(elasticsearch, deployment)
    .then(function(seq){
      console.log('Downloading CouchDB changes feed from ' + seq);
      let changes = couchdb.changes({ limit: changesLimit, since: seq })
      return changes.then(function(couchDbResult){
          console.log('There are ' + couchDbResult.results.length + ' changes to process');
        if (!couchDbResult.results.length) {
          return emptyChangesSummary(couchDbResult.last_seq);
        }
        else{
          let docsToDownload = _.uniq(couchDbResult.results, _.property('id'));
          const editedDocIds = _.pluck(docsToDownload, 'id');
          console.log('There are ' + docsToDownload.length + ' new / changed documents');
          return loadAndStoreDocs(apm, couchdb, concurrentDocLimit, docsToDownload, deployment)
          .then(function() {
            return {
              edited: editedDocIds || [],
              lastSeq: couchDbResult.last_seq
            };
          });
        }
      })  
    })
  };

module.exports = function(apm, couchdb, concurrentDocLimit, changesLimit, deployment, elasticsearch) {
  let importLoop = function(changesSummary) {
    deployment = 'pih_malawi_test';
    concurrentDocLimit = concurrentDocLimit || 100;
    changesLimit = changesLimit || 10000;
    console.log('Performing an import batch of up to ' + changesLimit + ' changes');
  
    return importChangesBatch(apm, couchdb, concurrentDocLimit, changesLimit, deployment, elasticsearch)
    .then(function(changes) {
      storeSeq(elasticsearch, deployment, changes.lastSeq);
      console.log(changes);
      if (changesCount(changes) > 0) {
        console.log('Batch completed with ' + changesCount(changes) + ' changes');
        return importLoop({
          edited: changesSummary.edited.concat(changes.edited),
          lastSeq : changes.lastSeq
        });
      } else {
        console.log('Import loop complete, ' + changesCount(changesSummary) + ' changes total');

        // It's almost completely unlikely that this nunber will be different due to how
        // couchdb works (if there are absolutely no changes in a batch that's because you already
        // got to the end of all changes last time) but I'm counting that as an implementation
        // detail (eg maybe we change to a filtered changes feed in the future), so let's be sure.
        accChanges.lastSeq = changes.lastSeq;
        return accChanges;
        }
    });
  }

  return importLoop(emptyChangesSummary());
}