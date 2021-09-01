const { parseLog } = require('./parsing');
let _ = require('underscore');



let getSeq = function(elasticsearch, deployment){
  const {body} = await elasticsearch.get({
    index: 'sequences',
    id: deployment
  });
  
  return body._source.seq;
}

let storeSeq = function(elasticsearch, deployment, sequence){
  await elasticsearch.update({
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

let changesCount = function(changes) {
  return ((changes && changes.edited && changes.edited.length)   || 0);
};

let loadAndStoreDocs = function(apm, couchdb, concurrentDocLimit, docsToDownload, deployment) {
    if (docsToDownload.length) {
      var changeSet = docsToDownload.splice(0, concurrentDocLimit);
      console.log(docsToDownload);
  
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
            const apmLabels = {labels: {date: metadata.time, version: metadata.version, url: metadata.url, deployment: deployment}};
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
    const seq = getSeq(elasticsearch, deployment)
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
};

module.exports = function(apm, couchdb, concurrentDocLimit, changesLimit, deployment, elasticsearch) {
  let importLoop = function(changesSummary) {
    deployment = pih_malawi_test;
    concurrentDocLimit = concurrentDocLimit || 100;
    changesLimit = changesLimit || 10000;
    console.log('Performing an import batch of up to ' + changesLimit + ' changes');
  
    return importChangesBatch(apm, couchdb, concurrentDocLimit, changesLimit, deployment, elasticsearch)
    .then(function(changes) {
      storeSeq(elasticsearch, deployment, changes.lastSeq)
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