'use strict';

const assert = require('assert');
const path = require('path');
const { PDFKitTextMeasurer } = require('./measure-text');
const { makeBadge } = require('./make-badge');
const isPng = require('is-png');
const sinon = require('sinon');
const svg2img = require('./svg-to-img');

const DEJAVU_PATH = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf');

describe('The rasterizer', function () {
  let measurer;
  before(function () {
    measurer = new PDFKitTextMeasurer(DEJAVU_PATH);
  });

  let cacheGet;
  beforeEach(function () { cacheGet = sinon.spy(svg2img._imgCache, 'get'); });
  afterEach(function () { cacheGet.restore(); });

  it('should produce PNG', function() {
    const svg = makeBadge(measurer, { text: ['cactus', 'grown'], format: 'svg' });
    return svg2img(svg, 'png')
      .then(data => {
        assert.ok(isPng(data));
      });
  });

  it('should cache its results', function() {
    const svg = makeBadge(measurer, { text: ['will-this', 'be-cached?'], format: 'svg' });
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
