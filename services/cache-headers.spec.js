'use strict'

const { test, given } = require('sazerac')
const { coalesceCacheLength } = require('./cache-headers')

describe('coalesceCacheLength', function() {
  const exampleCacheConfig = { defaultCacheLengthSeconds: 777 }
  test(coalesceCacheLength, () => {
    given(exampleCacheConfig, undefined, {}).expect(777)
    given(exampleCacheConfig, 900, {}).expect(900)
    given(exampleCacheConfig, 900, { maxAge: 1000 }).expect(1000)
    given(exampleCacheConfig, 900, { maxAge: 400 }).expect(900)
  })
})
