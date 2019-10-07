'use strict'

const { expect } = require('chai')
const sinon = require('sinon')
const xpath = require('xpath')
const { exampleXml } = require('./dynamic-response-fixtures')
const DynamicXml = require('./dynamic-xml.service')
const { InvalidResponse } = require('..')

describe('DynamicXml', function() {
  describe('transform()', function() {
    beforeEach(function() {
      sinon.stub(xpath, 'select').returns(undefined)
    })

    afterEach(function() {
      sinon.restore()
    })

    it('throws InvalidResponse on unsupported query', function() {
      expect(() =>
        DynamicXml.prototype.transform({
          pathExpression: '//book/title',
          buffer: exampleXml,
        })
      )
        .to.throw(InvalidResponse)
        .with.property('prettyMessage', 'unsupported query')
    })
  })
})
