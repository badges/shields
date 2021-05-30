'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('gradle plugin portal')
  .get(
    '/com.gradle.plugin-publish'
  )
  .expectRedirect(
    `/maven-metadata/v.svg?color=blue&label=plugin%20portal&metadataUrl=${encodeURIComponent(
      'https://plugins.gradle.org/m2/com/gradle/plugin-publish/com.gradle.plugin-publish.gradle.plugin/maven-metadata.xml'
    )}`
  )
