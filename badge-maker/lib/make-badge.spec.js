'use strict'

const { expect } = require('chai')
const snapshot = require('snap-shot-it')
const isSvg = require('is-svg')
const prettier = require('prettier')
const makeBadge = require('./make-badge')

function expectBadgeToMatchSnapshot(format) {
  snapshot(prettier.format(makeBadge(format), { parser: 'html' }))
}

describe('The badge generator', function () {
  describe('SVG', function () {
    it('should produce SVG', function () {
      expect(makeBadge({ label: 'cactus', message: 'grown', format: 'svg' }))
        .to.satisfy(isSvg)
        .and.to.include('cactus')
        .and.to.include('grown')
    })

    it('should match snapshot', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
      })
    })

    it('should replace undefined svg badge style with "flat"', function () {
      const jsonBadgeWithUnknownStyle = makeBadge({
        label: 'name',
        message: 'Bob',
        format: 'svg',
      })
      const jsonBadgeWithDefaultStyle = makeBadge({
        label: 'name',
        message: 'Bob',
        format: 'svg',
        style: 'flat',
      })
      expect(jsonBadgeWithUnknownStyle)
        .to.equal(jsonBadgeWithDefaultStyle)
        .and.to.satisfy(isSvg)
    })

    it('should fail with unknown svg badge style', function () {
      expect(() =>
        makeBadge({
          label: 'name',
          message: 'Bob',
          format: 'svg',
          style: 'unknown_style',
        })
      ).to.throw(Error, "Unknown badge style: 'unknown_style'")
    })
  })

  describe('"flat" template badge generation', function () {
    it('should match snapshots: message/label, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat',
        color: '#b3e',
        labelColor: '#0f0',
      })
    })

    it('should match snapshots: message/label, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'flat',
        color: '#b3e',
      })
    })

    it('should match snapshots: message only, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'flat',
        color: '#b3e',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, with logo and labelColor', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'flat',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message/label, with links', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat',
        color: '#b3e',
        labelColor: '#0f0',
        links: ['https://shields.io/', 'https://www.google.co.uk/'],
      })
    })

    it('should match snapshots: black text when the label color is light', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat',
        color: '#000',
        labelColor: '#f3f3f3',
      })
    })

    it('should match snapshots: black text when the message color is light', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat',
        color: '#e2ffe1',
        labelColor: '#000',
      })
    })
  })

  describe('"flat-square" template badge generation', function () {
    it('should match snapshots: message/label, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat-square',
        color: '#b3e',
        labelColor: '#0f0',
      })
    })

    it('should match snapshots: message/label, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat-square',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'flat-square',
        color: '#b3e',
      })
    })

    it('should match snapshots: message only, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'flat-square',
        color: '#b3e',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, with logo and labelColor', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'flat-square',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message/label, with links', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat-square',
        color: '#b3e',
        labelColor: '#0f0',
        links: ['https://shields.io/', 'https://www.google.co.uk/'],
      })
    })

    it('should match snapshots: black text when the label color is light', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat-square',
        color: '#000',
        labelColor: '#f3f3f3',
      })
    })

    it('should match snapshots: black text when the message color is light', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'flat-square',
        color: '#e2ffe1',
        labelColor: '#000',
      })
    })
  })

  describe('"plastic" template badge generation', function () {
    it('should match snapshots: message/label, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'plastic',
        color: '#b3e',
        labelColor: '#0f0',
      })
    })

    it('should match snapshots: message/label, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'plastic',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'plastic',
        color: '#b3e',
      })
    })

    it('should match snapshots: message only, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'plastic',
        color: '#b3e',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, with logo and labelColor', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'plastic',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message/label, with links', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'plastic',
        color: '#b3e',
        labelColor: '#0f0',
        links: ['https://shields.io/', 'https://www.google.co.uk/'],
      })
    })

    it('should match snapshots: black text when the label color is light', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'plastic',
        color: '#000',
        labelColor: '#f3f3f3',
      })
    })

    it('should match snapshots: black text when the message color is light', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'plastic',
        color: '#e2ffe1',
        labelColor: '#000',
      })
    })
  })

  describe('"for-the-badge" template badge generation', function () {
    // https://github.com/badges/shields/issues/1280
    it('numbers should produce a string', function () {
      expect(
        makeBadge({
          label: 1998,
          message: 1999,
          format: 'svg',
          style: 'for-the-badge',
        })
      )
        .to.include('1998')
        .and.to.include('1999')
    })

    it('lowercase/mixedcase string should produce uppercase string', function () {
      expect(
        makeBadge({
          label: 'Label',
          message: '1 string',
          format: 'svg',
          style: 'for-the-badge',
        })
      )
        .to.include('LABEL')
        .and.to.include('1 STRING')
    })

    it('should match snapshots: message/label, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'for-the-badge',
        color: '#b3e',
        labelColor: '#0f0',
      })
    })

    it('should match snapshots: message/label, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'for-the-badge',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'for-the-badge',
        color: '#b3e',
      })
    })

    it('should match snapshots: message only, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'for-the-badge',
        color: '#b3e',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, with logo and labelColor', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'for-the-badge',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message/label, with links', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'for-the-badge',
        color: '#b3e',
        labelColor: '#0f0',
        links: ['https://shields.io/', 'https://www.google.co.uk/'],
      })
    })

    it('should match snapshots: black text when the label color is light', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'for-the-badge',
        color: '#000',
        labelColor: '#f3f3f3',
      })
    })

    it('should match snapshots: black text when the message color is light', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'for-the-badge',
        color: '#e2ffe1',
        labelColor: '#000',
      })
    })
  })

  describe('"social" template badge generation', function () {
    it('should produce capitalized string for badge key', function () {
      expect(
        makeBadge({
          label: 'some-key',
          message: 'some-value',
          format: 'svg',
          style: 'social',
        })
      )
        .to.include('Some-key')
        .and.to.include('some-value')
    })

    // https://github.com/badges/shields/issues/1606
    it('should handle empty strings used as badge keys', function () {
      expect(
        makeBadge({
          label: '',
          message: 'some-value',
          format: 'json',
          style: 'social',
        })
      )
        .to.include('></text>')
        .and.to.include('some-value')
    })

    it('should match snapshots: message/label, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'social',
        color: '#b3e',
        labelColor: '#0f0',
      })
    })

    it('should match snapshots: message/label, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'social',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, no logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'social',
        color: '#b3e',
      })
    })

    it('should match snapshots: message only, with logo', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'social',
        color: '#b3e',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message only, with logo and labelColor', function () {
      expectBadgeToMatchSnapshot({
        label: '',
        message: 'grown',
        format: 'svg',
        style: 'social',
        color: '#b3e',
        labelColor: '#0f0',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })

    it('should match snapshots: message/label, with links', function () {
      expectBadgeToMatchSnapshot({
        label: 'cactus',
        message: 'grown',
        format: 'svg',
        style: 'social',
        color: '#b3e',
        labelColor: '#0f0',
        links: ['https://shields.io/', 'https://www.google.co.uk/'],
      })
    })
  })

  describe('badges with logos should always produce the same badge', function () {
    it('badge with logo', function () {
      expectBadgeToMatchSnapshot({
        label: 'label',
        message: 'message',
        format: 'svg',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      })
    })
  })
})
