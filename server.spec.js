'use strict';

const { expect } = require('chai');
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
    // This is the first server test to run, and often times out.
    this.timeout(5000);
    return fetch(`${baseUri}/:fruit-apple-green.svg`)
      .then(res => {
        expect(res.ok).to.equal(true);
        return res.text();
      }).then(text => {
        expect(text)
          .to.satisfy(isSvg)
          .and.to.contain('fruit')
          .and.to.contain('apple');
      });
  });

  it('should produce colorscheme PNG badges', function () {
    return fetch(`${baseUri}/:fruit-apple-green.png`)
      .then(res => {
        expect(res.ok).to.equal(true);
        return res.buffer();
      }).then(data => {
        expect(data).to.satisfy(isPng);
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
          expect(res.status).to.equal(200);
          return res.text();
        }).then(text => {
          expect(text).to.contain(expectedError);
        });
    });
  });

  describe('analytics endpoint', function () {
    it('should return analytics in the expected format', function () {
      return fetch(`${baseUri}/$analytics/v1`)
        .then(res => {
          expect(res.ok).to.equal(true);
          return res.json();
        }).then(json => {
          const expectedKeys = [
            'vendorMonthly',
            'rawMonthly',
            'vendorFlatMonthly',
            'rawFlatMonthly',
            'vendorFlatSquareMonthly',
            'rawFlatSquareMonthly',
          ];
          expect(json).to.have.all.keys(...expectedKeys);

          Object.values(json).forEach(stats => {
            expect(stats).to.be.an('array').with.length(36);
          });
        });
    });
  });
});
