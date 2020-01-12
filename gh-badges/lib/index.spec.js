'use strict'

const { expect, use } = require('chai')
const isPng = require('is-png')
const isSvg = require('is-svg')
const { makeBadge, ValidationError } = require('.')
use(require('chai-as-promised'))

describe('makeBadge function', function() {
  it('should produce badge with valid input', async function() {
    expect(
      await makeBadge({
        text: ['build', 'passed'],
      })
    ).to.satisfy(isSvg)
    expect(
      await makeBadge({
        text: ['build', 'passed'],
        format: 'svg',
        colorscheme: 'green',
        template: 'flat',
      })
    ).to.satisfy(isSvg)
    expect(
      await makeBadge({
        text: ['build', 'passed'],
        foo: 'bar', // extra key
      })
    ).to.satisfy(isSvg)
    expect(
      await makeBadge({ text: ['build', 'passed'], format: 'png' })
    ).to.satisfy(isPng)
  })

  it('should throw a ValidationError with invalid inputs', async function() {
    try {
      await makeBadge({})
    } catch (e) {
      expect(e).to.be.an.instanceof(ValidationError)
      expect(e.message).to.equal('Field `text` is required')
    }

    try {
      await makeBadge({ text: ['build'] })
    } catch (e) {
      expect(e).to.be.an.instanceof(ValidationError)
      expect(e.message).to.equal('Field `text` must be an array of 2 strings')
    }

    try {
      await makeBadge({ text: ['build', 'passed', 'something else'] })
    } catch (e) {
      expect(e).to.be.an.instanceof(ValidationError)
      expect(e.message).to.equal('Field `text` must be an array of 2 strings')
    }

    try {
      await makeBadge({ text: ['build', 'passed'], labelColor: 7 })
    } catch (e) {
      expect(e).to.be.an.instanceof(ValidationError)
      expect(e.message).to.equal('Field `labelColor` must be of type string')
    }

    try {
      await makeBadge({ text: ['build', 'passed'], format: 'foobar' })
    } catch (e) {
      expect(e).to.be.an.instanceof(ValidationError)
      expect(e.message).to.equal(
        'Field `format` must be one of (svg,json,png,jpg,gif)'
      )
    }

    try {
      await makeBadge({
        text: ['build', 'passed'],
        template: 'something else',
      })
    } catch (e) {
      expect(e).to.be.an.instanceof(ValidationError)
      expect(e.message).to.equal(
        'Field `template` must be one of (plastic,flat,flat-square,for-the-badge,social)'
      )
    }

    try {
      await makeBadge({ text: ['build', 'passed'], template: 'popout' })
    } catch (e) {
      expect(e).to.be.an.instanceof(ValidationError)
      expect(e.message).to.equal(
        'Field `template` must be one of (plastic,flat,flat-square,for-the-badge,social)'
      )
    }
  })
})
