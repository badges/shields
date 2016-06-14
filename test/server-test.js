require('../server.js');
console.log('ready');
process.on('SIGTERM', function() { process.exit(0); });
