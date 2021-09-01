const program = require('commander');

module.exports = function() {
    let couchdbUrl;
    program
        .version(require('./package.json').version)
        .arguments('<source>')
        .option('--doc-limit [value]', 'number of docs to batch')
        .option('--changes-limit [value]', 'number of changes to batch')
        .option('--deployment', 'cht deployment', 'no specified deployment')
        .action(function(source) {
        couchdbUrl = source;
        });

        program.parse(process.argv);

    if (!couchdbUrl) {
        program.help();
    }

    return {
        couchdbUrl: couchdbUrl,
        elasticUrl: program['elasticsearch'],
        apmUrl: program['target'],
        couch2pgDocLimit: program['doc-limit'],
        couch2pgChangesLimit: program['changes-limit'],
        deployment: program['deployment']
      };
};