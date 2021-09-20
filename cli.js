const program = require('commander');

module.exports = function() {
    let couchdbUrl;
    program
        .version(require('./package.json').version)
        .arguments('<source>')
        .option('--doclimit [value]', 'number of docs to batch', 100)
        .option('--changeslimit [value]', 'number of changes to batch', 1000)
        .option('--deployment [value]', 'cht deployment', 'no specified deployment')
        .option('--fromSeq [value]', 'startingSeq', 'now')
        .action(function(source) {
        couchdbUrl = source;
        });

    program.parse(process.argv);
    
    if (!couchdbUrl) {
        program.help();
    }

    return {
        couchdbUrl: couchdbUrl,
        couch2pgDocLimit: program.opts().doclimit,
        couch2pgChangesLimit: program.opts().changeslimit,
        deployment: program.opts().deployment,
        fromSeq: program.opts().fromSeq
      };
};