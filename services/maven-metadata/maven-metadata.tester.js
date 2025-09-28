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
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=releaseProperty',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.30' })

t.create('latest strategy')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=latestProperty',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.31-beta1' })

t.create('comparableVersion strategy')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=highestVersion',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.31-rc1' })

t.create('comparableVersion strategy with versionPrefix')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&versionPrefix=1.31',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.31-rc1' })

t.create('comparableVersion strategy with versionSuffix')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&versionSuffix=1',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.31-rc1' })

t.create('comparableVersion strategy with versionPrefix and versionSuffix')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&versionPrefix=1.31&versionSuffix=1',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.31-rc1' })

t.create('comparableVersion strategy with filter')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&filter=*beta*',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'v1.31-beta1' })

t.create('no versions matched')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&filter=foobar',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, mockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'no matching versions found' })

t.create('invalid maven-metadata.xml uri')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/com/google/code/gson/gson/foobar.xml',
  )
  .expectBadge({ label: 'maven', message: 'not found' })

t.create('filter with latest strategy')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=latestProperty&filter=*beta*',
  )
  .expectBadge({
    label: 'maven',
    message: 'filter is not valid with strategy latestProperty',
  })

t.create('filter with release strategy')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=releaseProperty&filter=*beta*',
  )
  .expectBadge({
    label: 'maven',
    message: 'filter is not valid with strategy releaseProperty',
  })

const emptyMockMetaData = `
<metadata>
  <groupId>mocked-group-id</groupId>
  <artifactId>mocked-artifact-id</artifactId>
  <versioning>
    <lastUpdated>20190902002617</lastUpdated>
  </versioning>
</metadata>
`

t.create('release not found')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=releaseProperty',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, emptyMockMetaData),
  )
  .expectBadge({ label: 'maven', message: "property 'release' not found" })

t.create('latest not found')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=latestProperty',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, emptyMockMetaData),
  )
  .expectBadge({ label: 'maven', message: "property 'latest' not found" })

t.create('no versions')
  .get(
    '/v.json?metadataUrl=https://repo1.maven.org/maven2/mocked-group-id/mocked-artifact-id/maven-metadata.xml&strategy=highestVersion',
  )
  .intercept(nock =>
    nock('https://repo1.maven.org/maven2')
      .get('/mocked-group-id/mocked-artifact-id/maven-metadata.xml')
      .reply(200, emptyMockMetaData),
  )
  .expectBadge({ label: 'maven', message: 'no versions found' })
