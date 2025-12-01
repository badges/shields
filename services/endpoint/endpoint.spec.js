import { expect } from 'chai'
import sinon from 'sinon'
import nock from 'nock'
import configModule from 'config'
import { defaultContext } from '../test-helpers.js'
import { InvalidParameter } from '../index.js'
import Endpoint from './endpoint.service.js'

describe('Endpoint', function () {
  afterEach(function () {
    sinon.restore()
  })
  it('allows unsecured endpoint when config enabled', async function () {
    nock('http://example.com').get('/badge').reply(200, {
      schemaVersion: 1,
      label: 'unsecured',
      message: 'allowed',
    })

    sinon.stub(configModule.util, 'toObject').returns({
      public: { allowUnsecuredEndpointRequests: true },
    })

    const endpoint = new Endpoint(defaultContext, {
      handleInternalErrors: false,
    })
    const result = await endpoint.handle(
      {},
      { url: 'http://example.com/badge' },
    )
    expect(result).to.include({ label: 'unsecured', message: 'allowed' })
  })

  it('blocks unsecured endpoint when config disabled', async function () {
    nock('http://example.com').get('/badge').reply(200, {
      schemaVersion: 1,
      label: 'unsecured',
      message: 'allowed',
    })

    sinon.stub(configModule.util, 'toObject').returns({
      public: { allowUnsecuredEndpointRequests: false },
    })

    const endpoint = new Endpoint(defaultContext, {
      handleInternalErrors: false,
    })
    let error
    try {
      await endpoint.handle({}, { url: 'http://example.com/badge' })
    } catch (e) {
      error = e
    }
    expect(error)
      .to.be.instanceOf(InvalidParameter)
      .to.have.property('prettyMessage', 'please use https')
  })
})
