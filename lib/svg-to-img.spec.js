'use strict';

const assert = require('assert');
const makeBadge = require('./make-badge');
const isPng = require('is-png');
const sinon = require('sinon');
const svg2img = require('./svg-to-img');

describe('The rasterizer', function () {
  let cacheGet;
  beforeEach(function () { cacheGet = sinon.spy(svg2img._imgCache, 'get'); });
  afterEach(function () { cacheGet.restore(); });

  it('should produce PNG', function() {
    const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' });
    return svg2img(svg, 'png')
      .then(data => {
        assert.ok(isPng(data));
      });
  });

  it('should cache its results', function() {
    const svg = makeBadge({ text: ['will-this', 'be-cached?'], format: 'svg' });
    return svg2img(svg, 'png')
      .then(data => {
        assert.ok(isPng(data));
        assert.equal(cacheGet.called, false);
      })
      .then(() => {
        return svg2img(svg, 'png')
          .then(data => {
            assert.ok(isPng(data));
            assert.ok(cacheGet.calledOnce);
          });
      });
  });
});
