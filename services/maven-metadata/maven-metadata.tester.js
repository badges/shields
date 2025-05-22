import { createServiceTester } from '../tester.js'
import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
export const t = await createServiceTester()

const mockMetaData = `
<metadata>
  <groupId>mocked-group-id</groupId>
  <artifactId>mocked-artifact-id</artifactId>
  <versioning>
    <latest>1.31-beta1</latest>
    <release>1.30</release>
    <versions>
      <version>1.0</version>
      <version>1.31-rc1</version>
      <version>1.31-beta1</version>
      <version>1.30</version>
    </versions>
    <lastUpdated>20190902002617</lastUpdated>
  </versioning>
</metadata>
`

t.create('valid maven-metadata.xml uri')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml',
  )
  .expectBadge({
    label: 'maven',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('release strategy')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=release',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.30' })

t.create('latest strategy')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=latest',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.31-beta1' })

t.create('comparableVersion strategy')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=comparableVersion',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.31-rc1' })

t.create('invalid maven-metadata.xml uri')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/code/gson/gson/foobar.xml',
  )
  .expectBadge({ label: 'maven', message: 'not found' })
