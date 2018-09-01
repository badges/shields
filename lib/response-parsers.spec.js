'use strict'

const { expect } = require('chai')
const { asJson, asXml } = require('./response-parsers')
const { InvalidResponse } = require('../services/errors')

describe('Json parser', function() {
  it('parses json', async function() {
    const json = await asJson({ buffer: '{"foo": "bar"}' })

    expect(json).to.deep.equal({ foo: 'bar' })
  })

  it('thows invalid response if json parsing fails', async function() {
    try {
      await asJson({ buffer: 'not json' })
      expect.fail('Expected to throw')
    } catch (e) {
      expect(e).to.be.an.instanceof(InvalidResponse)
      expect(e.message).to.equal(
        'Invalid Response: Unexpected token o in JSON at position 1'
      )
      expect(e.prettyMessage).to.equal('unparseable json response')
    }
  })
})

describe('Xml parser', function() {
  it('parses xml', async function() {
    const xml = await asXml({ buffer: '<foo>bar</foo>' })

    expect(xml).to.deep.include({ foo: 'bar' })
  })

  it('thows invalid response if xml parsing fails', async function() {
    try {
      await asXml({ buffer: 'not xml' })
      expect.fail('Expected to throw')
    } catch (e) {
      expect(e).to.be.an.instanceof(InvalidResponse)
      expect(e.prettyMessage).to.equal('unparseable xml response')
    }
  })
})
