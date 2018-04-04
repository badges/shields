'use strict';

const { expect } = require('chai');
const snapshot = require('snap-shot-it');
const { _badgeKeyWidthCache } = require('./make-badge');
const isSvg = require('is-svg');
const testHelpers = require('./make-badge-test-helpers');

const makeBadge = testHelpers.makeBadge();

describe('The badge generator', function () {
  beforeEach(function () {
    _badgeKeyWidthCache.clear();
  });

  describe('css color regex', function () {
    it('should check if given valid hex color', function () {
      const colorsTrue = ["#4c1","#4C1","#abc123","#ABC123"];
      const colorsFalse = ["red","#123red","#red"];
      colorsTrue.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.equal(color);
      });
      colorsFalse.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.be.undefined;
      });
    });
  });

  describe('SVG', function () {
    it('should produce SVG', function () {
      const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' });
      expect(svg)
        .to.satisfy(isSvg)
        .and.to.include('cactus')
        .and.to.include('grown');
    });

    it('should always produce the same SVG (unless we have changed something!)', function () {
      const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' });
      snapshot(svg);
    });

    it('should cache width of badge key', function () {
      makeBadge({ text: ['cached', 'not-cached'], format: 'svg' });
      expect(_badgeKeyWidthCache.cache).to.have.keys('cached');
    });
  });

  describe('JSON', function () {
    it('should always produce the same JSON (unless we have changed something!)', function () {
      const json = makeBadge({ text: ['cactus', 'grown'], format: 'json' });
      snapshot(json);
    });

    it('should replace unknown json template with "default"', function () {
      const jsonBadgeWithUnknownStyle = makeBadge({ text: ['name', 'Bob'], format: 'json', template: 'unknown_style' });
      const jsonBadgeWithDefaultStyle = makeBadge({ text: ['name', 'Bob'], format: 'json', template: 'default' });
      expect(jsonBadgeWithUnknownStyle).to.equal(jsonBadgeWithDefaultStyle);
      expect(JSON.parse(jsonBadgeWithUnknownStyle)).to.deep.equal({name: "name", value: "Bob"})
    });

    it('should replace unknown svg template with "flat"', function () {
      const jsonBadgeWithUnknownStyle = makeBadge({ text: ['name', 'Bob'], format: 'svg', template: 'unknown_style' });
      const jsonBadgeWithDefaultStyle = makeBadge({ text: ['name', 'Bob'], format: 'svg', template: 'flat' });
      expect(jsonBadgeWithUnknownStyle).to.equal(jsonBadgeWithDefaultStyle)
        .and.to.satisfy(isSvg);
    });
  });

  describe('"for-the-badge" template badge generation', function () {
     // https://github.com/badges/shields/issues/1280
    it('numbers should produce a string', function () {
      const svg = makeBadge({ text: [1998, 1999], format: 'svg', template: 'for-the-badge' });
      expect(svg).to.include('1998').and.to.include('1999');
    });

    it('lowercase/mixedcase string should produce uppercase string', function () {
      const svg = makeBadge({ text: ["Label", "1 string"], format: 'svg', template: 'for-the-badge' });
      expect(svg).to.include('LABEL').and.to.include('1 STRING');
    });
  });

  describe('"social" template badge generation', function () {
    it('should produce capitalized string for badge key', function () {
      const svg = makeBadge({ text: ["some-key", "some-value"], format: 'svg', template: 'social' });
      expect(svg).to.include('Some-key').and.to.include('some-value');
    });

     // https://github.com/badges/shields/issues/1606
    it('should handle empty strings used as badge keys', function () {
      const svg = makeBadge({ text: ["", "some-value"], format: 'json', template: 'social' });
      expect(svg).to.include('""').and.to.include('some-value');
    });
  });
});
