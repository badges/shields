import { expect } from 'chai'
import nock from 'nock'
import { defaultContext } from '../test-helpers.js'
import { InvalidParameter } from '../index.js'
import Endpoint from './endpoint.service.js'

describe('Endpoint', function () {
  it('allows unsecured endpoint when config enabled', async function () {
    nock('http://example.com').get('/badge').reply(200, {
      schemaVersion: 1,
      label: 'unsecured',
      message: 'allowed',
    })

    const endpoint = new Endpoint(defaultContext, {
      handleInternalErrors: false,
    })
    endpoint.allowUnsecuredEndpointRequests = true
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

    const endpoint = new Endpoint(defaultContext, {
      handleInternalErrors: false,
    })
    endpoint.allowUnsecuredEndpointRequests = false
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
