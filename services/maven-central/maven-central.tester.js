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

t.create('version ending with zero')
  .get('/mocked-group-id/mocked-artifact-id.json')
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(
        200,
        `
      <metadata>
        <groupId>mocked-group-id</groupId>
        <artifactId>mocked-artifact-id</artifactId>
        <versioning>
            <latest>1.30</latest>
            <release>1.30</release>
            <versions>
                <version>1.30</version>
            </versions>
            <lastUpdated>20190902002617</lastUpdated>
        </versioning>
        </metadata>
      `
      )
  )
  .expectBadge({ label: 'maven-central', message: 'v1.30' })
