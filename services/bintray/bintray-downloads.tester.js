'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('downloads')
  .get('/dt/asciidoctor/maven/asciidoctorj.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('downloads (not found)')
  .get('/dt/asciidoctor/maven/not-a-real-package.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })

t.create('downloads (mocked)')
  .get('/dt/asciidoctor/maven/asciidoctorj.json')
  .intercept(nock =>
    nock('https://bintray.com')
      .get('/api/ui/package/asciidoctor/maven/asciidoctorj/total_downloads')
      .reply(200, {
        totalDownloads: 420,
      })
  )
  .expectBadge({
    label: 'downloads',
    message: '420',
  })
