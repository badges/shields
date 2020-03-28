'use strict'

const { isFileSize } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('EssentialsX (id 9089)')
  .get('/9089.json')
  .expectBadge({ label: 'size', message: isFileSize })

t.create('Resource hosted externally (id 0)')
  .get('/0.json')
  .intercept(nock =>
    nock('https://api.spiget.org')
      .get('/v2/resources/0')
      .reply(200, {
        downloads: 9211,
        file: {
          type: 'external',
          size: 0,
          sizeUnit: '',
        },
        testedVersions: ['1.13', '1.14', '1.15'],
        rating: {
          count: 6,
          average: 4.83,
        },
      })
  )
  .expectBadge({
    lavel: 'size',
    message: 'resource hosted externally',
  })

t.create('Invalid Resource (id 1)')
  .get('/1.json')
  .expectBadge({
    label: 'size',
    message: 'not found',
  })
