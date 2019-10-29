'use strict'

const { expect } = require('chai')
const jsonPath = require('./json-path')

describe('JSON Path service factory', function() {
  describe('_getData()', function() {
    it('should throw error if it is not overridden', async function() {
      class BaseService {}
      class JsonPathService extends jsonPath(BaseService) {}
      const jsonPathServiceInstance = new JsonPathService()
      try {
        await jsonPathServiceInstance._getData({})
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e.message).to.equal(
          '_getData() function not implemented for JsonPathService'
        )
      }
    })
  })
})
