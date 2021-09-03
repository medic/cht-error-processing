const program = require('commander');

module.exports = function() {
    let couchdbUrl;
    program
        .version(require('./package.json').version)
        .arguments('<source>')
        .option('--doc-limit [value]', 'number of docs to batch', 100)
        .option('--changes-limit [value]', 'number of changes to batch', 10000)
        .option('--deployment [value]', 'cht deployment', 'no specified deployment')
        .action(function(source) {
        couchdbUrl = source;
        });

    program.parse(process.argv);
    console.log(couchdbUrl);
    console.log(program.opts().deployment);

    if (!couchdbUrl) {
        program.help();
    }

    return {
        couchdbUrl: couchdbUrl,
        couch2pgDocLimit: program.opts().doc-limit,
        couch2pgChangesLimit: program.opts().changes-limit,
        deployment: program.opts().deployment
      };
};