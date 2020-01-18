'use strict'

const { expect, use } = require('chai')
const isPng = require('is-png')
const isSvg = require('is-svg')
const proxyquire = require('proxyquire')
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

  it('should throw a ValidationError with invalid input ("text" missing)', async function() {
    return expect(makeBadge({}))
      .to.eventually.be.rejectedWith('Field `text` is required')
      .and.be.an.instanceOf(ValidationError)
  })

  it('should throw a ValidationError with invalid input ("text" invalid)', async function() {
    return expect(makeBadge({ text: ['build'] }))
      .to.eventually.be.rejectedWith(
        'Field `text` must be an array of 2 strings'
      )
      .and.be.an.instanceOf(ValidationError)
  })

  it('should throw a ValidationError with invalid input ("text" invalid)', async function() {
    return expect(makeBadge({ text: ['build', 'passed', 'something else'] }))
      .to.eventually.be.rejectedWith(
        'Field `text` must be an array of 2 strings'
      )
      .and.be.an.instanceOf(ValidationError)
  })

  it('should throw a ValidationError with invalid input ("labelColor" invalid)', async function() {
    return expect(makeBadge({ text: ['build', 'passed'], labelColor: 7 }))
      .to.eventually.be.rejectedWith(
        'Field `labelColor` must be of type string'
      )
      .and.be.an.instanceOf(ValidationError)
  })

  it('should throw a ValidationError with invalid input ("format" invalid)', async function() {
    return expect(makeBadge({ text: ['build', 'passed'], format: 'foobar' }))
      .to.eventually.be.rejectedWith(
        'Field `format` must be one of (svg,json,png,jpg,gif)'
      )
      .and.be.an.instanceOf(ValidationError)
  })

  it('should throw a ValidationError with invalid input ("template" invalid)', async function() {
    return expect(
      makeBadge({ text: ['build', 'passed'], template: 'something else' })
    )
      .to.eventually.be.rejectedWith(
        'Field `template` must be one of (plastic,flat,flat-square,for-the-badge,social)'
      )
      .and.be.an.instanceOf(ValidationError)
  })

  it('should throw a ValidationError with invalid input ("template" invalid)', async function() {
    return expect(makeBadge({ text: ['build', 'passed'], template: 'popout' }))
      .to.eventually.be.rejectedWith(
        'Field `template` must be one of (plastic,flat,flat-square,for-the-badge,social)'
      )
      .and.be.an.instanceOf(ValidationError)
  })

  it('should throw a ValidationError for raster format without gm dependency', async function() {
    const proxy = proxyquire('./index', { gm: null })
    const { makeBadge, ValidationError } = proxy

    return expect(makeBadge({ text: ['build', 'passed'], format: 'png' }))
      .to.eventually.be.rejectedWith(
        'peerDependency gm is required for output in .png format'
      )
      .and.be.an.instanceOf(ValidationError)
  })
})
