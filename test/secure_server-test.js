process.env.HTTPS=true
process.env.PORT='2222'
process.env.HTTPS_KEY='test/certs/server.key'
process.env.HTTPS_CRT='test/certs/server.crt'
require('../server.js');
console.log('ready');
process.on('SIGTERM', function() { process.exit(0); });
