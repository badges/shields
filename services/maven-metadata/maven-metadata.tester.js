'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

t.create('valid maven-metadata.xml uri')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
  )
  .expectBadge({
    label: 'maven',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('version ending with zero')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml'
  )
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
  .expectBadge({ label: 'maven', message: 'v1.30' })

t.create('invalid maven-metadata.xml uri')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/code/gson/gson/foobar.xml'
  )
  .expectBadge({ label: 'maven', message: 'not found' })
