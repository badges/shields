// We don't require ass because we can't test a majority of the server reliably.
//require('ass');
require('../server.js');
console.log('ready');
process.on('SIGTERM', function() { process.exit(0); });
