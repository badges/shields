import { testAuth } from '../test-helpers.js'
import ObsService from './obs.service.js'

describe('ObsService', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        ObsService,
        `<?xml version="1.0" encoding="UTF-8"?>
        <status package="example" code="passed"></status>`,
        { 'Content-Type': 'application/xml' },
      )
    })
  })
})
