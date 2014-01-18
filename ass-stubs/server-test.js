require('ass'); require('../server.js');
console.log('done');
process.on('SIGTERM', function() { process.exit(0); });
