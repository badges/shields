'use strict'

const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('latest version')
  .get('/com.github.fabriziocucci/yacl4j.json') // http://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/
  .expectBadge({
    label: 'maven-central',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('latest 0.8 version')
  .get('/com.github.fabriziocucci/yacl4j/0.8.json') // http://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/
  .expectBadge({
    label: 'maven-central',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('inexistent artifact')
  .get('/inexistent-group-id/inexistent-artifact-id.json')
  .expectBadge({ label: 'maven-central', message: 'not found' })

t.create('inexistent version prefix')
  .get('/com.github.fabriziocucci/yacl4j/99.json')
  .expectBadge({ label: 'maven-central', message: 'version prefix not found' })
