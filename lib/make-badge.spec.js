'use strict'

const { test, given, forCases } = require('sazerac')
const { expect } = require('chai')
const snapshot = require('snap-shot-it')
const { _badgeKeyWidthCache } = require('./make-badge')
const isSvg = require('is-svg')
const testHelpers = require('./make-badge-test-helpers')
const colorschemes = require('./colorscheme.json')

const makeBadge = testHelpers.makeBadge()

function testColor(color = '') {
  return JSON.parse(
    makeBadge({
      text: ['name', 'Bob'],
      colorB: color,
      format: 'json',
      template: '_shields_test',
    })
  ).colorB
}

describe('The badge generator', () => {
  beforeEach(() => {
    _badgeKeyWidthCache.clear()
  })

  describe('color test', () => {
    test(testColor, () => {
      // valid hex
      given('#4c1').expect('#4c1')
      given('#4C1').expect('#4C1')
      given('#abc123').expect('#abc123')
      given('#ABC123').expect('#ABC123')
      // valid rgb(a)
      given('rgb(0,128,255)').expect('rgb(0,128,255)')
      given('rgba(0,128,255,0)').expect('rgba(0,128,255,0)')
      // valid hsl(a)
      given('hsl(100, 56%, 10%)').expect('hsl(100, 56%, 10%)')
      given('hsla(25,20%,0%,0.1)').expect('hsla(25,20%,0%,0.1)')
      // either a css named color or colorscheme
      given('papayawhip').expect('papayawhip')
      given('red').expect(colorschemes['red'].colorB)
      given('green').expect(colorschemes['green'].colorB)
      given('blue').expect(colorschemes['blue'].colorB)
      given('yellow').expect(colorschemes['yellow'].colorB)

      forCases(
        // invalid hex
        given('#123red'), // contains letter above F
        given('#red'), // contains letter above F
        given('123456'), // contains no # symbol
        given('123'), // contains no # symbol
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

  describe('SVG', () => {
    it('should produce SVG', () => {
      const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' })
      expect(svg)
        .to.satisfy(isSvg)
        .and.to.include('cactus')
        .and.to.include('grown')
    })

    it('should always produce the same SVG (unless we have changed something!)', () => {
      const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' })
      snapshot(svg)
    })

    it('should cache width of badge key', () => {
      makeBadge({ text: ['cached', 'not-cached'], format: 'svg' })
      expect(_badgeKeyWidthCache.cache).to.have.keys('cached')
    })
  })

  describe('JSON', () => {
    it('should always produce the same JSON (unless we have changed something!)', () => {
      const json = makeBadge({ text: ['cactus', 'grown'], format: 'json' })
      snapshot(json)
    })

    it('should replace unknown json template with "default"', () => {
      const jsonBadgeWithUnknownStyle = makeBadge({
        text: ['name', 'Bob'],
        format: 'json',
        template: 'unknown_style',
      })
      const jsonBadgeWithDefaultStyle = makeBadge({
        text: ['name', 'Bob'],
        format: 'json',
        template: 'default',
      })
      expect(jsonBadgeWithUnknownStyle).to.equal(jsonBadgeWithDefaultStyle)
      expect(JSON.parse(jsonBadgeWithUnknownStyle)).to.deep.equal({
        name: 'name',
        value: 'Bob',
      })
    })

    it('should replace unknown svg template with "flat"', () => {
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
  })

  describe('"for-the-badge" template badge generation', () => {
    // https://github.com/badges/shields/issues/1280
    it('numbers should produce a string', () => {
      const svg = makeBadge({
        text: [1998, 1999],
        format: 'svg',
        template: 'for-the-badge',
      })
      expect(svg)
        .to.include('1998')
        .and.to.include('1999')
    })

    it('lowercase/mixedcase string should produce uppercase string', () => {
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

  describe('"social" template badge generation', () => {
    it('should produce capitalized string for badge key', () => {
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
    it('should handle empty strings used as badge keys', () => {
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
  describe('badges with logos should always produce the same badge', () => {
    it('shields GitHub logo default color (#333333)', () => {
      const svg = makeBadge({
        text: ['label', 'message'],
        format: 'svg',
        logo: 'github',
      })
      snapshot(svg)
    })

    it('shields GitHub logo custom color (whitesmoke)', () => {
      const svg = makeBadge({
        text: ['label', 'message'],
        format: 'svg',
        logo: 'github',
        logoColor: 'whitesmoke',
      })
      snapshot(svg)
    })

    it('simple-icons javascript logo default color (#F7DF1E)', () => {
      const svg = makeBadge({
        text: ['label', 'message'],
        format: 'svg',
        logo: 'javascript',
      })
      snapshot(svg)
    })

    it('simple-icons javascript logo custom color (rgba(46,204,113,0.8))', () => {
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
