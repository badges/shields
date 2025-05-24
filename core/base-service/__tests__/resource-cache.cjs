const { expect } = require('chai')
const { describe, it, beforeEach } = require('mocha')
const fetchMock = require('fetch-mock').sandbox()
const {
  getCachedResource,
  clearResourceCache,
} = require('../resource-cache.js')

describe('Resource Cache', function () {
  beforeEach(function () {
    clearResourceCache()
    fetchMock.reset()
  })

  it('should use cached response if valid', async function () {
    fetchMock.get('https://www.foobar.com/baz', { value: 1 })
    let resp = await getCachedResource({
      url: 'https://www.foobar.com/baz',
      requestFetcher: fetchMock,
    })
    expect(resp).to.deep.equal({ value: 1 })

    fetchMock.get('https://www.foobar.com/baz', { value: 2 })
    resp = await getCachedResource({
      url: 'https://www.foobar.com/baz',
      requestFetcher: fetchMock,
    })
    expect(resp).to.deep.equal({ value: 1 })
  })

  it('should not use cached response if expired', async function () {
    fetchMock.get('https://www.foobar.com/test', { value: 2 })
    const resp = await getCachedResource(
      {
        url: 'https://www.foobar.com/test',
        requestFetcher: fetchMock,
      },
      1000,
    )
    expect(resp).to.deep.equal({ value: 2 })
  })

  it('should handle fetch errors gracefully', async function () {
    fetchMock.get('https://www.foobar.com/error', {
      throws: new Error('HTTP error! status: 500'),
    })
    const result = await getCachedResource(
      {
        url: 'https://www.foobar.com/error',
        requestFetcher: fetchMock,
      },
      1000,
    )
    expect(result).to.equal('Inaccessible: HTTP error! status: 500')
  })

  it('should handle network errors gracefully', async function () {
    fetchMock.get('https://www.foobar.com/network-error', {
      throws: new Error('Network error'),
    })
    const result = await getCachedResource(
      {
        url: 'https://www.foobar.com/network-error',
        requestFetcher: fetchMock,
      },
      1000,
    )
    expect(result).to.equal('Inaccessible: Network error')
  })

  it('should handle invalid JSON responses', async function () {
    fetchMock.get('https://www.foobar.com/invalid-json', 'Invalid JSON')
    const result = await getCachedResource(
      {
        url: 'https://www.foobar.com/invalid-json',
        requestFetcher: fetchMock,
      },
      1000,
    )
    expect(result).to.equal('Invalid JSON')
  })
})

describe('getCachedResource', function () {
  const url = 'https://example.com/resource'
  const mockResponse = { data: 'test' }

  beforeEach(function () {
    clearResourceCache()
    fetchMock.reset()
  })

  it('should fetch and cache resource', async function () {
    fetchMock.get(url, mockResponse)
    const result = await getCachedResource({
      url,
      requestFetcher: fetchMock,
    })
    expect(result).to.deep.equal(mockResponse)
  })

  it('should return cached resource if available', async function () {
    fetchMock.get(url, mockResponse)
    await getCachedResource({
      url,
      requestFetcher: fetchMock,
    })
    const result = await getCachedResource({
      url,
      requestFetcher: fetchMock,
    })
    expect(result).to.deep.equal(mockResponse)
  })

  it('should handle fetch errors gracefully', async function () {
    fetchMock.get(url, { throws: new Error('Network error') })
    const result = await getCachedResource({
      url,
      requestFetcher: fetchMock,
    })
    expect(result).to.equal('Inaccessible: fetch failed')
  })
})
