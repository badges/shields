'use strict'

const chai = require('chai')
const { expect } = chai
const jsonPath = require('./json-path')

chai.use(require('chai-as-promised'))

describe('JSON Path service factory', function() {
  describe('_getData()', function() {
    it('should throw error if it is not overridden', function() {
      class BaseService {}
      class JsonPathService extends jsonPath(BaseService) {}
      const jsonPathServiceInstance = new JsonPathService()

      return expect(jsonPathServiceInstance._getData({})).to.be.rejectedWith(
        Error,
        '_getData() function not implemented for JsonPathService'
      )
    })
  })
})
