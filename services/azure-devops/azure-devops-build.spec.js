import { testAuth } from '../test-helpers.js'
import AzureDevOpsBuild from './azure-devops-build.service.js'

const passingSvg =
  '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><g><text>passing</text></g></svg>'

describe('AzureDevOpsBuild', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(AzureDevOpsBuild, 'BasicAuth', passingSvg)
    })
  })
})
