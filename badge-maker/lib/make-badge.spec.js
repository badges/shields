'use strict'

const { expect } = require('chai')
const snapshot = require('snap-shot-it')
const isSvg = require('is-svg')
const makeBadge = require('./make-badge')

describe('The badge generator', function() {
  describe('SVG', function() {
    it('should produce SVG', function() {
      expect(
        makeBadge({
          label: 'cactus',
          message: 'grown',
          style: 'flat',
        })
      )
        .to.satisfy(isSvg)
        .and.to.include('cactus')
        .and.to.include('grown')
    })

    it('should match snapshot', function() {
      snapshot(makeBadge({ label: 'cactus', message: 'grown', style: 'flat' }))
    })
  })

  describe('Styles', function() {
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
