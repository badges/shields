const assert = require('assert');
const sinon = require('sinon');
const WritableStream = require('memory-streams').WritableStream;
const isPng = require('is-png');

const badge = require('../lib/badge');
const svg2img = require('../lib/svg-to-img.js');

describe('The rasterizer', function () {
  let cacheGet;
  beforeEach(function () { cacheGet = sinon.spy(svg2img._imgCache, 'get'); });
  afterEach(function () { cacheGet.restore(); });

  it('should produce PNG', function(done) {
    badge({ text: ['cactus', 'grown'], format: 'svg' }, svg => {
      const out = new WritableStream();

      svg2img(svg, 'png', out, () => {
        assert.ok(isPng(out.toBuffer()));
        done();
      });
    });
  });

  it('should cache its results', function(done) {
    badge({ text: ['will-this', 'be-cached?'], format: 'svg' }, svg => {
      const out1 = new WritableStream();
      const out2 = new WritableStream();

      svg2img(svg, 'png', out1, () => {
        assert.ok(isPng(out1.toBuffer()));
        assert.equal(cacheGet.called, false);

        svg2img(svg, 'png', out2, () => {
          assert.ok(isPng(out2.toBuffer()));
          assert.ok(cacheGet.calledOnce);

          done();
        });
      });
    });
  });
});
