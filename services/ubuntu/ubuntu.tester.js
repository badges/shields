'use strict'

const {
  isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Ubuntu package (default distribution, valid)')
  .get('/apt.json')
  .expectBadge({
    label: 'ubuntu',
    message: isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  })

t.create('Ubuntu package (valid, mocked response)')
  .get('/ubuntu-wallpapers/bionic.json')
  .intercept(nock =>
    nock('https://api.launchpad.net')
      .get(
        '/1.0/ubuntu/+archive/primary?ws.op=getPublishedSources&exact_match=true&order_by_date=true&status=Published&source_name=ubuntu-wallpapers&distro_series=https%3A%2F%2Fapi.launchpad.net%2F1.0%2Fubuntu%2Fbionic'
      )
      .reply(200, {
        entries: [
          {
            source_package_name: 'ubuntu-wallpapers',
            source_package_version: '18.04.1-0ubuntu1',
          },
        ],
      })
  )
  .expectBadge({ label: 'ubuntu', message: 'v18.04.1-0ubuntu1' })

t.create('Ubuntu package (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'ubuntu', message: 'not found' })

t.create('Ubuntu package (series not found)')
  .get('/apt/not-a-series.json')
  .expectBadge({ label: 'ubuntu', message: 'series not found' })
