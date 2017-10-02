const assert = require('assert');
const config = require('./lib/test-config');
const fetch = require('node-fetch');
const fs = require('fs');
const isPng = require('is-png');
const isSvg = require('is-svg');
const path = require('path');
const serverHelpers = require('./lib/in-process-server-test-helpers');
const sinon = require('sinon');
const svg2img = require('./lib/svg-to-img');

describe('The server', function () {
  const baseUri = `http://127.0.0.1:${config.port}`;

  let server;
  before('Start running the server', function () {
    this.timeout(5000);
    server = serverHelpers.start();
  });
  after('Shut down the server', function () { serverHelpers.stop(server); });

  it('should produce colorscheme badges', function () {
    return fetch(`${baseUri}/:fruit-apple-green.svg`)
      .then(res => {
        assert.ok(res.ok);
        return res.text();
      }).then(text => {
        assert.ok(isSvg(text));
        assert(text.includes('fruit'), 'fruit');
        assert(text.includes('apple'), 'apple');
      });
  });

  it('should produce colorscheme PNG badges', function () {
    return fetch(`${baseUri}/:fruit-apple-green.png`)
      .then(res => {
        assert.ok(res.ok);
        return res.buffer();
      }).then(data => {
        assert.ok(isPng(data));
      });
  });

  context('with svg2img error', function () {
    const expectedError = fs.readFileSync(path.resolve(__dirname, 'public', '500.html'));

    let toBufferStub;
    beforeEach(function () {
      toBufferStub = sinon.stub(svg2img._imageMagick.prototype, 'toBuffer')
        .callsArgWith(1, Error('whoops'));
    });
    afterEach(function () { toBufferStub.restore(); });

    it('should emit the 500 message', function () {
      return fetch(`${baseUri}/:some_new-badge-green.png`)
        .then(res => {
          // This emits status code 200, though 500 would be preferable.
          assert.equal(res.status, 200);
          return res.text();
        }).then(text => {
          assert.equal(text, expectedError);
        });
    });
  });

  describe('analytics endpoint', function () {
    it('should return analytics in the expected format', function () {
      return fetch(`${baseUri}/$analytics/v1`)
        .then(res => {
          assert.ok(res.ok);
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
