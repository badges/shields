var assert = require('assert');
var sinon = require('sinon');
var http = require('http');
var cproc = require('child_process');
var fs = require('fs');
var path = require('path');
var isPng = require('is-png');
var isSvg = require('is-svg');
var svg2img = require('../lib/svg-to-img');

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
  var server;
  before('Start running the server', function() {
    this.timeout(5000);
    // This is a bit gross, but it works.
    process.argv = ['', '', port, 'localhost'];
    server = require('../server');
  });
  after('Shut down the server', function(done) {
    server.close(function () { done(); });
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

  context('with svg2img error', function () {
    var expectedError = fs.readFileSync(path.resolve(__dirname, '..', 'public', '500.html'));

    var toBufferStub;
    beforeEach(function () {
      toBufferStub = sinon.stub(svg2img._imageMagick.prototype, 'toBuffer')
        .callsArgWith(1, Error('whoops'));
    });
    afterEach(function () { toBufferStub.restore(); });

    it('should emit the 500 message', function (done) {
      http.get(url + ':some_new-badge-green.png',
        function(res) {
          // This emits status code 200, though 500 would be preferable.
          assert.equal(res.statusCode, 200);

          var buffer = '';
          res.on('data', function(chunk) { buffer += ''+chunk; });
          res.on('end', function() {
            assert.equal(buffer, expectedError);
            done();
          });
      });
    });
  });
});
