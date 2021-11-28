import { expect } from 'chai'
import nock from 'nock'
import { getCachedResource, clearResourceCache } from './resource-cache.js'

describe('Resource Cache', function () {
  beforeEach(function () {
    clearResourceCache()
  })

  it('should use cached response if valid', async function () {
    let resp

    nock('https://www.foobar.com').get('/baz').reply(200, { value: 1 })
    resp = await getCachedResource({ url: 'https://www.foobar.com/baz' })
    expect(resp).to.deep.equal({ value: 1 })
    expect(nock.isDone()).to.equal(true)
    nock.cleanAll()

    nock('https://www.foobar.com').get('/baz').reply(200, { value: 2 })
    resp = await getCachedResource({ url: 'https://www.foobar.com/baz' })
    expect(resp).to.deep.equal({ value: 1 })
    expect(nock.isDone()).to.equal(false)
    nock.cleanAll()
  })

  it('should not use cached response if expired', async function () {
    let resp

    nock('https://www.foobar.com').get('/baz').reply(200, { value: 1 })
    resp = await getCachedResource({
      url: 'https://www.foobar.com/baz',
      ttl: 1,
    })
    expect(resp).to.deep.equal({ value: 1 })
    expect(nock.isDone()).to.equal(true)
    nock.cleanAll()

    nock('https://www.foobar.com').get('/baz').reply(200, { value: 2 })
    resp = await getCachedResource({
      url: 'https://www.foobar.com/baz',
      ttl: 1,
    })
    expect(resp).to.deep.equal({ value: 2 })
    expect(nock.isDone()).to.equal(true)
    nock.cleanAll()
  })
})
