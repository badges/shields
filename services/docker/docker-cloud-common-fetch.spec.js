import sinon from 'sinon'
import { expect } from 'chai'
import { fetchBuild } from './docker-cloud-common-fetch.js'

describe('fetchBuild', function () {
  it('invokes withJwtAuth', async function () {
    const serviceInstance = {
      _requestJson: sinon.stub().resolves('fake-response'),
      authHelper: {
        withJwtAuth: sinon.stub(),
      },
    }

    const resp = await fetchBuild(serviceInstance, {
      user: 'user',
      repo: 'repo',
    })

    expect(serviceInstance.authHelper.withJwtAuth.calledOnce).to.be.true
    expect(serviceInstance._requestJson.calledOnce).to.be.true
    expect(resp).to.equal('fake-response')
  })
})
