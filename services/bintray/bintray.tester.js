'use strict'

const createServiceTester = require('../create-service-tester')
const { colorScheme } = require('../test-helpers')

const t = createServiceTester()

module.exports = t

t.create('version')
  .get('/v/asciidoctor/maven/asciidoctorj.json?style=_shields_test')
  .intercept(nock =>
    nock('https://bintray.com')
      .get('/api/v1/packages/asciidoctor/maven/asciidoctorj/versions/_latest')
      .reply(200, {
        name: '1.5.7',
      })
  )
  .expectJSON({
    name: 'bintray',
    value: 'v1.5.7',
    colorB: colorScheme.blue,
  })
