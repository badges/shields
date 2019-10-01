'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

t.create('valid maven-metadata.xml uri')
  .get(
    '/v.json?metadataUrl=http://central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
  )
  .expectBadge({
    label: 'maven',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('invalid maven-metadata.xml uri')
  .get(
    '/v.json?metadataUrl=http://central.maven.org/maven2/com/google/code/gson/gson/foobar.xml'
  )
  .expectBadge({ label: 'maven', message: 'not found' })
