'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'Maven-MetadataRedirect',
  title: 'Maven-MetadataRedirect',
  pathPrefix: '/maven-metadata/v',
}))

t.create('maven metadata (extension)')
  .get(
    '/http/central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml.json',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/maven-metadata/v.json?metadataUrl=${encodeURIComponent(
      'http://central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
    )}`
  )

t.create('maven metadata (no extension)')
  .get(
    '/http/central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/maven-metadata/v.svg?metadataUrl=${encodeURIComponent(
      'http://central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
    )}`
  )
