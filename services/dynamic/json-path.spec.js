import chai from 'chai';
const { expect } = chai
import jsonPath from './json-path.js';

chai.use(require('chai-as-promised'))

describe('JSON Path service factory', function () {
  describe('fetch()', function () {
    it('should throw error if it is not overridden', function () {
      class BaseService {}
      class JsonPathService extends jsonPath(BaseService) {}
      const jsonPathServiceInstance = new JsonPathService()

      return expect(jsonPathServiceInstance.fetch({})).to.be.rejectedWith(
        Error,
        'fetch() function not implemented for JsonPathService'
      )
    })
  })
})
