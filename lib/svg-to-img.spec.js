'use strict';

const { expect } = require('chai');
const isPng = require('is-png');
const sinon = require('sinon');
const svg2img = require('./svg-to-img');
const testHelpers = require('./make-badge-test-helpers');

const makeBadge = testHelpers.makeBadge();

describe('The rasterizer', function () {
  let cacheGet;
  beforeEach(function () { cacheGet = sinon.spy(svg2img._imgCache, 'get'); });
  afterEach(function () { cacheGet.restore(); });

  it('should produce PNG', function() {
    const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' });
    return svg2img(svg, 'png')
      .then(data => {
        expect(data).to.satisfy(isPng);
      });
  });

  it('should cache its results', function() {
    const svg = makeBadge({ text: ['will-this', 'be-cached?'], format: 'svg' });
    return svg2img(svg, 'png')
      .then(data => {
        expect(data).to.satisfy(isPng);
        expect(cacheGet).not.to.have.been.called;
      })
      .then(() => {
        return svg2img(svg, 'png')
          .then(data => {
            expect(data).to.satisfy(isPng);
            expect(cacheGet).to.have.been.calledOnce;
          });
      });
  });
});
