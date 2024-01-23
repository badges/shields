import sinon from 'sinon'
import { expect } from 'chai'
import { fetch } from './docker-hub-common-fetch.js'

describe('fetch', function () {
  it('invokes withJwtAuth', async function () {
    const serviceInstance = {
      _requestJson: sinon.stub().resolves('fake-response'),
      authHelper: {
        withJwtAuth: sinon.stub(),
      },
    }

    const resp = await fetch(serviceInstance, {})

    expect(serviceInstance.authHelper.withJwtAuth.calledOnce).to.be.true
    expect(serviceInstance._requestJson.calledOnce).to.be.true
    expect(resp).to.equal('fake-response')
  })
})
