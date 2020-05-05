'use strict'

const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version').get('/asciidoctor/maven/asciidoctorj.json').expectBadge({
  label: 'bintray',
  message: isVPlusDottedVersionNClausesWithOptionalSuffix,
})

t.create('version (not found)')
  .get('/asciidoctor/maven/not-a-real-package.json')
  .expectBadge({
    label: 'bintray',
    message: 'not found',
  })

t.create('version (mocked)')
  .get('/asciidoctor/maven/asciidoctorj.json')
  .intercept(nock =>
    nock('https://bintray.com')
      .get('/api/v1/packages/asciidoctor/maven/asciidoctorj/versions/_latest')
      .reply(200, {
        name: '1.5.7',
      })
  )
  .expectBadge({
    label: 'bintray',
    message: 'v1.5.7',
    color: 'blue',
  })
