'use strict'

const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

// https://plugins.gradle.org/m2/com/gradle/plugin-publish/com.gradle.plugin-publish.gradle.plugin/
t.create('latest version').get('/com.gradle.plugin-publish.json').expectBadge({
  label: 'plugin portal',
  message: isVPlusDottedVersionNClausesWithOptionalSuffix,
})

// https://plugins.gradle.org/m2/com/gradle/plugin-publish/com.gradle.plugin-publish.gradle.plugin/
t.create('latest 0.10 version')
  .get('/com.gradle.plugin-publish/0.10.json')
  .expectBadge({
    label: 'plugin portal',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('inexistent artifact')
  .get('/inexistent-plugin-id.json')
  .expectBadge({ label: 'plugin portal', message: 'not found' })

t.create('inexistent version prefix')
  .get('/com.gradle.plugin-publish/1000.json')
  .expectBadge({ label: 'plugin portal', message: 'version prefix not found' })

t.create('version ending with zero')
  .get('/mocked-plugin-id.json')
  .intercept(nock =>
    nock('https://plugins.gradle.org/m2')
      .get(
        '/mocked-plugin-id/mocked-plugin-id.gradle.plugin/maven-metadata.xml'
      )
      .reply(
        200,
        `
      <metadata>
        <groupId>mocked-plugin-id</groupId>
        <artifactId>mocked-plugin-id.gradle.plugin</artifactId>
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
  .expectBadge({ label: 'plugin portal', message: 'v1.30' })
