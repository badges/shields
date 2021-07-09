import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
export const t = await createServiceTester()

t.create('valid maven-metadata.xml uri')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
  )
  .expectBadge({
    label: 'maven',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('with version prefix')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/guava/guava/maven-metadata.xml&versionPrefix=27.'
  )
  .expectBadge({
    label: 'maven',
    message: 'v27.1-jre',
  })

t.create('with version suffix')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/guava/guava/maven-metadata.xml&versionSuffix=-android'
  )
  .expectBadge({
    label: 'maven',
    message: Joi.string().regex(/-android$/),
  })

t.create('with version prefix and suffix')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/guava/guava/maven-metadata.xml&versionPrefix=27.&versionSuffix=-android'
  )
  .expectBadge({
    label: 'maven',
    message: 'v27.1-android',
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

t.create('inexistent version prefix')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/maven-metadata.xml&versionPrefix=99'
  )
  .expectBadge({
    label: 'maven',
    message: 'version prefix or suffix not found',
  })

t.create('inexistent version suffix')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/maven-metadata.xml&versionSuffix=test'
  )
  .expectBadge({
    label: 'maven',
    message: 'version prefix or suffix not found',
  })
