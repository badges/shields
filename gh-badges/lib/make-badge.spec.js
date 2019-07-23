'use strict'

const { test, given, forCases } = require('sazerac')
const { expect } = require('chai')
const snapshot = require('snap-shot-it')
const isSvg = require('is-svg')
const makeBadge = require('./make-badge')

function testColor(color = '', colorAttr = 'colorB') {
  return JSON.parse(
    makeBadge({
      text: ['name', 'Bob'],
      [colorAttr]: color,
      format: 'json',
    })
  ).color
}

describe('The badge generator', function() {
  describe('color test', function() {
    test(testColor, () => {
      // valid hex
      forCases([
        given('#4c1'),
        given('#4C1'),
        given('4C1'),
        given('4c1'),
      ]).expect('#4c1')
      forCases([
        given('#abc123'),
        given('#ABC123'),
        given('abc123'),
        given('ABC123'),
      ]).expect('#abc123')
      // valid rgb(a)
      given('rgb(0,128,255)').expect('rgb(0,128,255)')
      given('rgba(0,128,255,0)').expect('rgba(0,128,255,0)')
      // valid hsl(a)
      given('hsl(100, 56%, 10%)').expect('hsl(100, 56%, 10%)')
      given('hsla(25,20%,0%,0.1)').expect('hsla(25,20%,0%,0.1)')
      // CSS named color.
      given('papayawhip').expect('papayawhip')
      // Shields named color.
      given('red').expect('red')
      given('green').expect('green')
      given('blue').expect('blue')
      given('yellow').expect('yellow')

      forCases(
        // invalid hex
        given('#123red'), // contains letter above F
        given('#red'), // contains letter above F
        // invalid rgb(a)
        given('rgb(220,128,255,0.5)'), // has alpha
        given('rgba(0,0,255)'), // no alpha
        // invalid hsl(a)
        given('hsl(360,50%,50%,0.5)'), // has alpha
        given('hsla(0,50%,101%)'), // no alpha
        // neither a css named color nor colorscheme
        given('notacolor'),
        given('bluish'),
        given('almostred'),
        given('brightmaroon'),
        given('cactus')
      ).expect(undefined)
    })
  })

  describe('color aliases', function() {
    test(testColor, () => {
      forCases([
        given('#4c1', 'color'),
        given('#4c1', 'colorB'),
        given('#4c1', 'colorscheme'),
      ]).expect('#4c1')
    })
  })

  describe('SVG', function() {
    it('should produce SVG', function() {
      const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' })
      expect(svg)
        .to.satisfy(isSvg)
        .and.to.include('cactus')
        .and.to.include('grown')
    })

    it('should always produce the same SVG (unless we have changed something!)', function() {
      const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' })
      snapshot(svg)
    })
  })

  describe('JSON', function() {
    it('should produce the expected JSON', function() {
      const json = makeBadge({
        text: ['cactus', 'grown'],
        format: 'json',
        links: ['https://example.com/', 'https://other.example.com/'],
      })
      expect(JSON.parse(json)).to.deep.equal({
        name: 'cactus',
        label: 'cactus',
        value: 'grown',
        message: 'grown',
        link: ['https://example.com/', 'https://other.example.com/'],
      })
    })

    it('should replace unknown svg template with "flat"', function() {
      const jsonBadgeWithUnknownStyle = makeBadge({
        text: ['name', 'Bob'],
        format: 'svg',
        template: 'unknown_style',
      })
      const jsonBadgeWithDefaultStyle = makeBadge({
        text: ['name', 'Bob'],
        format: 'svg',
        template: 'flat',
      })
      expect(jsonBadgeWithUnknownStyle)
        .to.equal(jsonBadgeWithDefaultStyle)
        .and.to.satisfy(isSvg)
    })

    it('should replace "popout-square" svg template with "flat-square"', function() {
      const jsonBadgeWithUnknownStyle = makeBadge({
        text: ['name', 'Bob'],
        format: 'svg',
        template: 'popout-square',
      })
      const jsonBadgeWithDefaultStyle = makeBadge({
        text: ['name', 'Bob'],
        format: 'svg',
        template: 'flat-square',
      })
      expect(jsonBadgeWithUnknownStyle)
        .to.equal(jsonBadgeWithDefaultStyle)
        .and.to.satisfy(isSvg)
    })
  })

  describe('"for-the-badge" template badge generation', function() {
    // https://github.com/badges/shields/issues/1280
    it('numbers should produce a string', function() {
      const svg = makeBadge({
        text: [1998, 1999],
        format: 'svg',
        template: 'for-the-badge',
      })
      expect(svg)
        .to.include('1998')
        .and.to.include('1999')
    })

    it('lowercase/mixedcase string should produce uppercase string', function() {
      const svg = makeBadge({
        text: ['Label', '1 string'],
        format: 'svg',
        template: 'for-the-badge',
      })
      expect(svg)
        .to.include('LABEL')
        .and.to.include('1 STRING')
    })
  })

  describe('"social" template badge generation', function() {
    it('should produce capitalized string for badge key', function() {
      const svg = makeBadge({
        text: ['some-key', 'some-value'],
        format: 'svg',
        template: 'social',
      })
      expect(svg)
        .to.include('Some-key')
        .and.to.include('some-value')
    })

    // https://github.com/badges/shields/issues/1606
    it('should handle empty strings used as badge keys', function() {
      const svg = makeBadge({
        text: ['', 'some-value'],
        format: 'json',
        template: 'social',
      })
      expect(svg)
        .to.include('""')
        .and.to.include('some-value')
    })
  })
  describe('badges with logos should always produce the same badge', function() {
    it('shields GitHub logo default color (#333333)', function() {
      const svg = makeBadge({
        text: ['label', 'message'],
        format: 'svg',
        logo: 'github',
      })
      snapshot(svg)
    })

    it('shields GitHub logo custom color (whitesmoke)', function() {
      const svg = makeBadge({
        text: ['label', 'message'],
        format: 'svg',
        logo: 'github',
        logoColor: 'whitesmoke',
      })
      snapshot(svg)
    })

    it('simple-icons javascript logo default color (#F7DF1E)', function() {
      const svg = makeBadge({
        text: ['label', 'message'],
        format: 'svg',
        logo: 'javascript',
      })
      snapshot(svg)
    })

    it('simple-icons javascript logo custom color (rgba(46,204,113,0.8))', function() {
      const svg = makeBadge({
        text: ['label', 'message'],
        format: 'svg',
        logo: 'javascript',
        logoColor: 'rgba(46,204,113,0.8)',
      })
      snapshot(svg)
    })
  })
})
