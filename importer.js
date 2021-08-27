const { parseLog } = require('./parsing');
let log = require('loglevel');

let emptyChangesSummary = function(lastSeq) {
    return {
      deleted: [],
      edited: [],
      lastSeq: lastSeq || 0
    };
}

var changesCount = function(changes) {
  return ((changes && changes.edited && changes.edited.length)   || 0);
};

let loadAndStoreDocs = function(apm, couchdb, concurrentDocLimit, docsToDownload, deployment) {
    if (docsToDownload.length) {
      var changeSet = docsToDownload.splice(0, concurrentDocLimit);
  
      return couchdb.allDocs({
        include_docs: true,
        keys: _.pluck(changeSet, 'id')
      }).then(function(couchDbResult) {
        log.debug('Pulled ' + couchDbResult.rows.length + ' results from couchdb');
      }).filter(doc => doc.type == 'feedback')
      .then(function(couchDbResult) {
        log.debug('Inserting ' + couchDbResult.rows.length + ' results into elasticApm');

        couchDbResult
        .rows
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


      }).then(function() {
            return loadAndStoreDocs(apm, couchdb, concurrentDocLimit, docsToDownload, deployment);
      });
    }
};
  
let importChangesBatch = function(apm, couchdb, concurrentDocLimit, changesLimit, deployment, source) {
    concurrentDocLimit = concurrentDocLimit || 100;
    changesLimit = changesLimit || 10000;
    return getSeq(db, source, deployment)
    .then(function(seq) {
        log.debug('Downloading CouchDB changes feed from ' + seq);
        return couchdb.changes({ limit: changesLimit, since: seq });
    })
    .then(function(changes) {
        log.info('There are ' + changes.results.length + ' changes to process');

        if (!changes.results.length) {
          return emptyChangesSummary(changes.last_seq);
        }
        else{
              docsToDownload = _.uniq(changes.results, _.property('id'));
  
          const editedDocIds = _.pluck(docsToDownload, 'id');
          log.debug('There are ' + docsToDownload.length + ' new / changed documents');
          return loadAndStoreDocs(apm, couchdb, concurrentDocLimit, docsToDownload, deployment)
          .then(function() {
            return {
              edited: editedDocIds || [],
              lastSeq: changes.last_seq
            };
          });
        }
    });
};

module.exports = function(apm, couchdb, concurrentDocLimit, changesLimit, deployment, source) {
  let importLoop = function(changesSummary) {
    log.debug('Performing an import batch of up to ' + changesLimit + ' changes');
  
    return importChangesBatch(apm, couchdb, concurrentDocLimit, changesLimit, deployment, source)
    .then(function(changes) {
      return storeSeq(db, changes.lastSeq, source).then(function() {
        if (changesCount(changes) > 0) {
          log.debug('Batch completed with ' + changesCount(changes) + ' changes');
  
          return importLoop({
            edited: changesSummary.edited.concat(changes.edited),
            lastSeq : changes.lastSeq
          });
        } else {
          log.debug('Import loop complete, ' + changesCount(changesSummary) + ' changes total');
  
          // It's almost completely unlikely that this nunber will be different due to how
          // couchdb works (if there are absolutely no changes in a batch that's because you already
          // got to the end of all changes last time) but I'm counting that as an implementation
          // detail (eg maybe we change to a filtered changes feed in the future), so let's be sure.
          accChanges.lastSeq = changes.lastSeq;
          return accChanges;
        }
      });
    });
  }

  return importLoop(emptyChangesSummary());
}