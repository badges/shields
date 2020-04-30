'use strict'

const { test, given, forCases } = require('sazerac')
const { expect } = require('chai')
const snapshot = require('snap-shot-it')
const isSvg = require('is-svg')
const makeBadge = require('./make-badge')
const { normalizeColor } = require('./color')

function testColor(color = '', colorAttr = 'color') {
  return normalizeColor(color)
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
      // Semantic color alias
      given('success').expect('brightgreen')
      given('informational').expect('blue')

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
      forCases([given('#4c1', 'color')]).expect('#4c1')
    })
  })

  describe('SVG', function() {
    it('should produce SVG', function() {
      const svg = makeBadge({
        label: 'cactus',
        message: 'grown',
        style: 'flat',
      })
      expect(svg)
        .to.satisfy(isSvg)
        .and.to.include('cactus')
        .and.to.include('grown')
    })

    it('should match snapshot', function() {
      snapshot(makeBadge({ label: 'cactus', message: 'grown', style: 'flat' }))
    })
  })

  describe('Styles', function() {
    // This test needs to move up a level.
    it.skip('should replace undefined svg template with "flat"', function() {
      const jsonBadgeWithUnknownStyle = makeBadge({
        label: 'name',
        message: 'Bob',
      })
      const jsonBadgeWithDefaultStyle = makeBadge({
        label: 'name',
        message: 'Bob',
        style: 'flat',
      })
      expect(jsonBadgeWithUnknownStyle)
        .to.equal(jsonBadgeWithDefaultStyle)
        .and.to.satisfy(isSvg)
    })

    it('should fail with unknown svg template', function() {
      expect(() =>
        makeBadge({
          text: ['name', 'Bob'],
          style: 'unknown_style',
        })
      ).to.throw(Error, "Unknown style: 'unknown_style'")
    })
  })

  describe('"flat" template badge generation', function() {
    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'flat',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'flat',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          color: '#b3e',
          style: 'flat',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'flat',
          color: '#b3e',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, with logo and labelColor', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'flat',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'flat',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('"flat-square" template badge generation', function() {
    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'flat-square',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'flat-square',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'flat-square',
          color: '#b3e',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'flat-square',
          color: '#b3e',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, with logo and labelColor', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'flat-square',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'flat-square',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('"plastic" template badge generation', function() {
    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'plastic',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'plastic',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'plastic',
          color: '#b3e',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'plastic',
          color: '#b3e',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, with logo and labelColor', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'plastic',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'plastic',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('"for-the-badge" template badge generation', function() {
    // https://github.com/badges/shields/issues/1280
    // This needs to be moved up a level.
    it.skip('numbers should produce a string', function() {
      const svg = makeBadge({
        label: 1998,
        message: 1999,
        style: 'for-the-badge',
      })
      expect(svg)
        .to.include('1998')
        .and.to.include('1999')
    })

    it('lowercase/mixedcase string should produce uppercase string', function() {
      const svg = makeBadge({
        label: 'Label',
        message: '1 string',
        style: 'for-the-badge',
      })
      expect(svg)
        .to.include('LABEL')
        .and.to.include('1 STRING')
    })

    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'for-the-badge',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'for-the-badge',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'for-the-badge',
          color: '#b3e',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'for-the-badge',
          color: '#b3e',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, with logo and labelColor', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'for-the-badge',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'for-the-badge',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('"social" template badge generation', function() {
    it('should produce capitalized string for badge key', function() {
      const svg = makeBadge({
        label: 'some-key',
        message: 'some-value',
        style: 'social',
      })
      expect(svg)
        .to.include('Some-key')
        .and.to.include('some-value')
    })

    // https://github.com/badges/shields/issues/1606
    it('should handle empty strings used as badge keys', function() {
      const svg = makeBadge({
        label: '',
        message: 'some-value',
        style: 'social',
      })
      expect(svg)
        .to.include('><')
        .and.to.include('some-value')
    })

    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'social',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'social',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'social',
          color: '#b3e',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'social',
          color: '#b3e',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message only, with logo and labelColor', function() {
      snapshot(
        makeBadge({
          label: '',
          message: 'grown',
          style: 'social',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'social',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('badges with logos should always produce the same badge', function() {
    it('badge with logo', function() {
      snapshot(
        makeBadge({
          label: 'label',
          message: 'message',
          style: 'flat',
          logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        })
      )
    })
  })
})
