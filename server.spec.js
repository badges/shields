var assert = require('assert');
var sinon = require('sinon');
var http = require('http');
var fs = require('fs');
var path = require('path');
var isPng = require('is-png');
var isSvg = require('is-svg');
const fetch = require('node-fetch');
var svg2img = require('./lib/svg-to-img');
const serverHelpers = require('./lib/in-process-server-test-helpers');

var port = '1111';
var url = 'http://127.0.0.1:' + port + '/';

describe('The server', function () {
  let server;
  before('Start running the server', function () {
    this.timeout(5000);
    server = serverHelpers.start();
  });
  after('Shut down the server', function () { serverHelpers.stop(server); });

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
    var expectedError = fs.readFileSync(path.resolve(__dirname, 'public', '500.html'));

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

  describe('analytics endpoint', function () {
    it('should return analytics in the expected format', function () {
      return fetch(`${url}$analytics/v1`)
        .then(res => {
          assert(res.ok);
          return res.json();
        }).then(json => {
          const keys = Object.keys(json);
          const expectedKeys = [
            'vendorMonthly',
            'rawMonthly',
            'vendorFlatMonthly',
            'rawFlatMonthly',
            'vendorFlatSquareMonthly',
            'rawFlatSquareMonthly',
          ];
          assert.deepEqual(keys.sort(), expectedKeys.sort());

          keys.forEach(k => {
            assert.ok(Array.isArray(json[k]));
            assert.equal(json[k].length, 36);
          });
        });
    });
  });
});
