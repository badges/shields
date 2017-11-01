'use strict';

const assert = require('assert');
const makeBadge = require('./make-badge');
const isSvg = require('is-svg');

describe('The badge generator', function () {
  it('should produce SVG', function () {
    const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' });
    assert.ok(isSvg(svg));
    assert(svg.includes('cactus'), 'cactus');
    assert(svg.includes('grown'), 'grown');
  });
});
