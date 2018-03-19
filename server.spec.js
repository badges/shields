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

  it('should produce colorscheme badges', async function () {
    // This is the first server test to run, and often times out.
    this.timeout(5000);
    const res = await fetch(`${baseUri}/:fruit-apple-green.svg`);
    expect(res.ok).to.be.true;
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple');
  });

  it('should produce colorscheme PNG badges', async function () {
    const res = await fetch(`${baseUri}/:fruit-apple-green.png`);
    expect(res.ok).to.be.true;
    expect(await res.buffer()).to.satisfy(isPng);
  });

  // https://github.com/badges/shields/pull/1319
  it('should not crash with a numeric logo', async function () {
    const res = await fetch(`${baseUri}/:fruit-apple-green.svg?logo=1`);
    expect(res.ok).to.be.true;
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple');
  });

  it('should not crash with a numeric link', async function () {
    const res = await fetch(`${baseUri}/:fruit-apple-green.svg?link=1`);
    expect(res.ok).to.be.true;
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple');
  });

  it('should not crash with a boolean link', async function () {
    const res = await fetch(`${baseUri}/:fruit-apple-green.svg?link=true`);
    expect(res.ok).to.be.true;
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple');
  });

  context('with svg2img error', function () {
    const expectedError = fs.readFileSync(path.resolve(__dirname, 'public', '500.html'));

    let toBufferStub;
    beforeEach(function () {
      toBufferStub = sinon.stub(svg2img._imageMagick.prototype, 'toBuffer')
        .callsArgWith(1, Error('whoops'));
    });
    afterEach(function () { toBufferStub.restore(); });

    it('should emit the 500 message', async function () {
      const res = await fetch(`${baseUri}/:some_new-badge-green.png`);
      // This emits status code 200, though 500 would be preferable.
      expect(res.status).to.equal(200);
      expect(await res.text()).to.include(expectedError);
    });
  });

  describe('analytics endpoint', function () {
    it('should return analytics in the expected format', async function () {
      const res = await fetch(`${baseUri}/$analytics/v1`);
      expect(res.ok).to.be.true;
      const json = await res.json();
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
