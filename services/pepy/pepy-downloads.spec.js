import { testAuth } from '../test-helpers.js'
import PepyDownloads from './pepy-downloads.service.js'

describe('PepyDownloads', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(PepyDownloads, 'ApiKeyHeader', { total_downloads: 42 })
    })
  })
})
