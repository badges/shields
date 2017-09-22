'use strict';

const assert = require('assert');
const badge = require('./badge');
const isPng = require('is-png');
const sinon = require('sinon');
const svg2img = require('./svg-to-img');

describe('The rasterizer', function () {
  let cacheGet;
  beforeEach(function () { cacheGet = sinon.spy(svg2img._imgCache, 'get'); });
  afterEach(function () { cacheGet.restore(); });

  it('should produce PNG', function(done) {
    badge({ text: ['cactus', 'grown'], format: 'svg' }, svg => {
      svg2img(svg, 'png', (err, data) => {
        assert.equal(err, null);
        assert.ok(isPng(data));
        done();
      });
    });
  });

  it('should cache its results', function(done) {
    badge({ text: ['will-this', 'be-cached?'], format: 'svg' }, svg => {
      svg2img(svg, 'png', (err, data) => {
        assert.equal(err, null);
        assert.ok(isPng(data));
        assert.equal(cacheGet.called, false);

        svg2img(svg, 'png', (err, data) => {
          assert.equal(err, null);
          assert.ok(isPng(data));
          assert.ok(cacheGet.calledOnce);

          done();
        });
      });
    });
  });
});
