import { test, given } from 'sazerac'
import Macports from './macports.service.js'

describe('Macports service', function () {
  test(Macports.portUrl, () => {
    given({ packageName: 'proxy-audio-device' }).expect(
      'https://ports.macports.org/api/v1/ports/proxy-audio-device/',
    )
    given({ packageName: 'foo bar' }).expect(
      'https://ports.macports.org/api/v1/ports/foo%20bar/',
    )
  })

  test(Macports.render, () => {
    given({ version: '2.54.0' }).expect({
      color: 'blue',
      message: 'v2.54.0',
      label: undefined,
    })

    given({ version: '1.0.7' }).expect({
      color: 'blue',
      message: 'v1.0.7',
      label: undefined,
    })
  })
})
