var assert = require('assert');
var http = require('http');
var cproc = require('child_process');
var fs = require('fs');
var isPng = require('is-png');
var isSvg = require('is-svg');

// Test parameters
var port = '1111';
var url = 'http://127.0.0.1:' + port + '/';
var server;

describe('The CLI', function () {

  it('should provide a help message', function(done) {
    var child = cproc.spawn('node', ['test/cli-test.js']);
    var buffer = '';
    child.stdout.on('data', function(chunk) {
      buffer += ''+chunk;
    });
    child.stdout.on('end', function() {
      assert(buffer.startsWith('Usage'));
      done();
    });
  });

  it('should produce default badges', function(done) {
    var child = cproc.spawn('node',
      ['test/cli-test.js', 'cactus', 'grown']);
    child.stdout.once('data', function(chunk) {
      var buffer = ''+chunk;
      assert.ok(isSvg(buffer));
      assert(buffer.includes('cactus'), 'cactus');
      assert(buffer.includes('grown'), 'grown');
      done();
    });
  });

  it('should produce colorschemed badges', function(done) {
    var child = cproc.spawn('node',
      ['test/cli-test.js', 'cactus', 'grown', ':green']);
    child.stdout.once('data', function(chunk) {
      var buffer = ''+chunk;
      assert.ok(isSvg(buffer));
      done();
    });
  });

  it('should produce right-color badges', function(done) {
    var child = cproc.spawn('node',
      ['test/cli-test.js', 'cactus', 'grown', '#abcdef']);
    child.stdout.once('data', function(chunk) {
      var buffer = ''+chunk;
      assert(buffer.includes('#abcdef'), '#abcdef');
      done();
    });
  });

  it('should produce PNG badges', function(done) {
    var child = cproc.spawn('node',
      ['test/cli-test.js', 'cactus', 'grown', '.png']);
    child.stdout.once('data', function(chunk) {
      assert.ok(isPng(chunk));
      done();
    });
  });

});

describe('The server', function () {

  before('Start running the server', function(done) {
    server = cproc.spawn('node', ['test/server-test.js', port]);
    var isDone = false;
    server.stdout.on('data', function(data) {
      if (data.toString().indexOf('ready') >= 0 && !isDone) { done(); isDone = true; }
    });
    server.stderr.on('data', function(data) { console.log(''+data); });
  });

  it('should produce colorscheme badges', function(done) {
    http.get(url + ':fruit-apple-green.svg',
      function(res) {
        var buffer = '';
        res.on('data', function(chunk) { buffer += ''+chunk; });
        res.on('end', function() {
          assert.ok(isSvg(buffer));
          assert(buffer.includes('fruit'), 'fruit');
          assert(buffer.includes('apple'), 'apple');
          done();
        });
    });
  });

  it('should produce colorscheme PNG badges', function(done) {
    http.get(url + ':fruit-apple-green.png',
      function(res) {
        res.once('data', function(chunk) {
          assert.ok(isPng(chunk));
          done();
        });
    });
  });

  after('Shut down the server', function(done) {
    server.kill();
    server.on('exit', function() { done(); });
  });

});
