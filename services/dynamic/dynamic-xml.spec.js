'use strict'

const { expect } = require('chai')
const { exampleXml } = require('./dynamic-response-fixtures')
const DynamicXml = require('./dynamic-xml.service')

describe('DynamicXml', function() {
  describe('transform()', function() {
    it('throws InvalidResponse on unsupported query', function() {
      expect(
        DynamicXml.prototype.transform({
          pathExpression: '//book[1]/title',
          buffer: exampleXml,
        })
      ).to.deep.equal({ values: ["XML Developer's Guide"] })
    })
  })
})
