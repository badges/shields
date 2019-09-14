'use strict'

const { ServiceTester } = require('../tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'maven-metadata',
  title: 'maven-metadata badge',
  pathPrefix: '/maven-metadata/v',
}))

t.create('valid maven-metadata.xml uri')
  .get(
    '.json?metadataUrl=http://central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
  )
  .expectBadge({
    label: 'maven',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('invalid maven-metadata.xml uri')
  .get(
    '.json?metadataUrl=http://central.maven.org/maven2/com/google/code/gson/gson/foobar.xml'
  )
  .expectBadge({ label: 'maven', message: 'not found' })
