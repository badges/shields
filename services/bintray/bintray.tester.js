'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'bintray',
  title: 'Bintray',
}))

t.create('no longer available (previously downloads)')
  .get('/dt/asciidoctor/maven/asciidoctorj.json')
  .expectBadge({
    label: 'bintray',
    message: 'no longer available',
  })

t.create('no longer available (previously version)')
  .get('/v/asciidoctor/maven/asciidoctorj.json')
  .expectBadge({
    label: 'bintray',
    message: 'no longer available',
  })
