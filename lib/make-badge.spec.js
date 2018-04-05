'use strict';

const { expect } = require('chai');
const snapshot = require('snap-shot-it');
const { _badgeKeyWidthCache } = require('./make-badge');
const isSvg = require('is-svg');
const testHelpers = require('./make-badge-test-helpers');
const colorschemes = require('./colorscheme.json');

const makeBadge = testHelpers.makeBadge();

describe('The badge generator', function () {
  beforeEach(function () {
    _badgeKeyWidthCache.clear();
  });

  describe('css color regex', function () {
    it('should check if given valid hex colors', function () {
      const colorsTrue = [
          '#4c1',
          '#4C1',
          '#abc123',
          '#ABC123',
        ];
      const colorsFalse = [
          '#123red', // contains letter above F
          '#red', // contains letter above F
          '123456', // contains no # symbol
          '123', // contains no # symbol
        ];
      colorsTrue.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.equal(color);
      });
      colorsFalse.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.be.undefined;
      });
    });

    it('should check if given valid rgb colors', function () {
      const colorsTrue = [
          'rgb(0,128,255)',
          'rgb(255, 0, 128)',
          'rgb(128,255,0)',
          'rgb(0,10, 100)',
          'rgb(255, 255,255)',
          'rgb(0,0,0)',
        ];
      const colorsFalse = [
          'rgb(256,128,255)', // r > 255
          'rgb(0 ,128,255)', // space before ','
          'rgb(0,0,280)', // g > 255
          'rgb(05,0,255)', // r starts with 0
        ];
      colorsTrue.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.equal(color);
      });
      colorsFalse.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.be.undefined;
      });
    });

    it('should check if given valid rgba colors', function () {
      const colorsTrue = [
          'rgba(0,128,255,0)',
          'rgba(255, 0, 128, 0.5)',
          'rgba(128,255,0,0.89)',
          'rgba(0,10, 100,0.2)',
          'rgba(255, 255,255,1)',
          'rgba(0,0,0,0)',
        ];
      const colorsFalse = [
          'rgba(0,0,255)', // no alpha
          'rgba(256,128,255,1)', // r > 255
          'rgba(0 ,128,255,0)', // space before ','
          'rgba(0,0,255,1.5)', // no decimal for 1
          'rgba(05,0,255,1)', // r starts with 0
        ];
      colorsTrue.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.equal(color);
      });
      colorsFalse.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.be.undefined;
      });
    });

    it('should check if given valid hsl colors', function () {
      const colorsTrue = [
          'hsl(0,0%,50%)',
          'hsl(25,20%,0%)',
          'hsl(100, 56%, 10%)',
          'hsl(250, 89%,90%)',
          'hsl(360,100%,100%)',
        ];
      const colorsFalse = [
          'hsl(050,50%,50%)', // h starts with 0
          'hsl(361,50%,50%)', // h > 360
          'hsl(250,150%,50%)', // s > 100%
          'hsl(0,50%,101%)', // l > 100%
        ];
      colorsTrue.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.equal(color);
      });
      colorsFalse.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.be.undefined;
      });
    });

    it('should check if given valid hsla colors', function () {
      const colorsTrue = [
          'hsla(0,0%,50%,0)',
          'hsla(25,20%,0%,0.1)',
          'hsla(100, 56%, 10%,0.5)',
          'hsla(250, 89%,90%,0.89)',
          'hsla(360,100%,100%,1)',
        ];
      const colorsFalse = [
          'hsla(050,50%,50%,0)', // h starts with 0
          'hsla(361,50%,50%,0.5)', // h > 360
          'hsla(250,150%,50%,1)', // s > 100%
          'hsla(0,50%,101%,0.7)', // l > 100%
          'hsla(0 ,50%,101%,0.7)', // space before ','
          'hsla(0,50%,101%)', // no alpha
          'hsla(0,50%,101%,1.5)', // alpha no decimal for 1
        ];
      colorsTrue.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.equal(color);
      });
      colorsFalse.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.be.undefined;
      });
    });

    it('should check if given valid css named colors', function () {
      const colorsTrue = [
          'papayawhip',
          'lightgoldenrodyellow',
          'cornflowerblue',
          'salmon',
        ];
      const colorsFalse = [
          'notacolor',
          'bluish',
          'almostred',
          'brightmaroon',
          'cactus',
        ];
      colorsTrue.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.equal(color);
      });
      colorsFalse.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.be.undefined;
      });
    });

    it('should check if given valid colorscheme colors', function () {
      const colorsTrue = [
          'red',
          'green',
          'blue',
          'yellow',
        ];
      const colorsFalse = [
          'notacolor',
          'bluish',
          'almostred',
          'brightmaroon',
          'cactus',
        ];
      colorsTrue.forEach((color) => {
        expect(JSON.parse(makeBadge({ text: ['name', 'Bob'], colorB: color, format: 'json', template: '_shields_test' })).colorB).to.equal(colorschemes[color].colorB);
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
