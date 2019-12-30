'use strict'

const snapshot = require('snap-shot-it')
const {
  plastic,
  flat,
  flatSquare,
  social,
  forTheBadge,
} = require('./badge-renderers')

describe('The badge renderer', function() {
  describe('"flat" template badge rendering', function() {
    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        flat({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        flat({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        flat({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        flat({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        flat({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('"flat-square" template badge rendering', function() {
    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        flatSquare({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        flatSquare({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        flatSquare({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        flatSquare({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        flatSquare({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('"plastic" template badge rendering', function() {
    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        plastic({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        plastic({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        plastic({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        plastic({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        plastic({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('"for-the-badge" template badge rendering', function() {
    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        forTheBadge({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        forTheBadge({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        forTheBadge({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        forTheBadge({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        forTheBadge({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })

  describe('"social" template badge rendering', function() {
    it('should match snapshots: message/label, no logo', function() {
      snapshot(
        social({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message/label, with logo', function() {
      snapshot(
        social({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message only, no logo', function() {
      snapshot(
        social({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
        })
      )
    })

    it('should match snapshots: message only, with logo', function() {
      snapshot(
        social({
          label: '',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          logo: 'javascript',
        })
      )
    })

    it('should match snapshots: message/label, with links', function() {
      snapshot(
        social({
          label: 'cactus',
          message: 'grown',
          color: '#b3e',
          labelColor: '#0f0',
          links: ['https://shields.io/', 'https://www.google.co.uk/'],
        })
      )
    })
  })
})
