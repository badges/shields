'use strict';

const { expect } = require('chai');

const { BaseJsonService } = require('./base');
const { invalidJSON } = require('./response-fixtures');

class DummyJsonService extends BaseJsonService {
  static get category() {
    return 'cat';
  }

  static get url() {
    return {
      base: 'foo',
    };
  }

  async handle() {
    const { value } = await this._requestJson();
    return { message: value };
  }
}

describe('BaseJsonService', () => {
  it('handles unparseable json responses', async function() {
    const sendAndCacheRequest = async () => ({
      buffer: invalidJSON,
      res: { statusCode: 200 },
    });
    const serviceInstance = new DummyJsonService(
      { sendAndCacheRequest },
      { handleInternalErrors: false }
    );
    const serviceData = await serviceInstance.invokeHandler({}, {});
    expect(serviceData).to.deep.equal({
      color: 'lightgray',
      message: 'unparseable json response',
    });
  });
});
