import { test, given } from 'sazerac'
import Macports from './macports.service.js'

describe('Macports service', function () {
  test(Macports.prototype.portUrl, () => {
    given({ packageName: 'proxy-audio-device' }).expect(
      'https://ports.macports.org/api/v1/ports/proxy-audio-device/',
    )
    given({ packageName: 'foo bar' }).expect(
      'https://ports.macports.org/api/v1/ports/foo%20bar/',
    )
  })
})
