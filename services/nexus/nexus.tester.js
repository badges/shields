import { isVPlusDottedVersionNClausesWithOptionalSuffix as isVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Nexus 2 - search release version valid artifact')
  .timeout(15000)
  .get('/r/com.google/bitcoinj.json?server=https://oss.sonatype.org')
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('Nexus 2 - search release version of an nonexistent artifact')
  .timeout(15000)
  .get(
    '/r/com.google.guava/nonexistent-artifact-id.json?server=https://oss.sonatype.org'
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact or version not found',
  })

t.create('Nexus 2 - search snapshot version valid snapshot artifact')
  .timeout(15000)
  .get(
    '/s/org.fusesource.apollo/apollo-karaf-feature.json?server=https://repository.jboss.org/nexus'
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('Nexus 2 - search snapshot version of an nonexistent artifact')
  .timeout(15000)
  .get(
    '/s/com.google.guava/nonexistent-artifact-id.json?server=https://oss.sonatype.org'
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact or version not found',
    color: 'red',
  })

t.create('Nexus 2 - repository version')
  .get(
    '/developer/ai.h2o/h2o-automl.json?server=https://repository.jboss.org/nexus'
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('Nexus 2 - repository version with query')
  .timeout(15000)
  .get(
    `/fs-public-snapshots/com.progress.fuse/fusehq.json?server=https://repository.jboss.org/nexus&queryOpt=${encodeURIComponent(
      ':p=tar.gz:c=agent-apple-osx'
    )}`
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('Nexus 2 - repository version of an nonexistent artifact')
  .timeout(15000)
  .get(
    '/developer/jboss/nonexistent-artifact-id.json?server=https://repository.jboss.org/nexus'
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact not found',
  })

t.create('Nexus 2 - snapshot version with + in version')
  .get(
    '/s/com.progress.fuse/fusehq.json?server=https://repository.jboss.org/nexus'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'com.progress.fuse', a: 'fusehq' })
      .reply(200, { data: [{ version: '7.0.1+19-8844c122-SNAPSHOT' }] })
  )
  .expectBadge({
    label: 'nexus',
    color: 'orange',
    message: isVersion,
  })

t.create('Nexus 2 - snapshot version with + and hex hash in version')
  .get(
    '/s/com.typesafe.akka/akka-stream-kafka_2.13.json?server=https://repository.jboss.org/nexus'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'com.typesafe.akka', a: 'akka-stream-kafka_2.13' })
      .reply(200, { data: [{ version: '2.1.0-M1+58-f25047fc-SNAPSHOT' }] })
  )
  .expectBadge({
    label: 'nexus',
    color: 'orange',
    message: isVersion,
  })

t.create('Nexus 2 - search snapshot version not in latestSnapshot')
  .get(
    '/s/com.progress.fuse/fusehq.json?server=https://repository.jboss.org/nexus'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'com.progress.fuse', a: 'fusehq' })
      .reply(200, { data: [{ version: '7.0.1-SNAPSHOT' }] })
  )
  .expectBadge({
    label: 'nexus',
    message: 'v7.0.1-SNAPSHOT',
    color: 'orange',
  })

t.create('Nexus 2 - search snapshot no snapshot versions')
  .get(
    '/s/com.progress.fuse/fusehq.json?server=https://repository.jboss.org/nexus'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'com.progress.fuse', a: 'fusehq' })
      .reply(200, { data: [{ version: '1.2.3' }] })
  )
  .expectBadge({
    label: 'nexus',
    message: 'no snapshot versions found',
    color: 'lightgrey',
  })

t.create('Nexus 2 - search release version')
  .get('/r/jboss/jboss-client.json?server=https://repository.jboss.org/nexus')
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'jboss', a: 'jboss-client' })
      .reply(200, { data: [{ latestRelease: '1.0.0' }] })
  )
  .expectBadge({
    label: 'nexus',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('Nexus 2 - repository release version')
  .get(
    '/developer/ai.h2o/h2o-automl.json?server=https://repository.jboss.org/nexus'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/artifact/maven/resolve')
      .query({
        g: 'ai.h2o',
        a: 'h2o-automl',
        r: 'developer',
        v: 'LATEST',
      })
      .reply(200, {
        data: {
          baseVersion: '1.2.3',
          version: '1.0.0',
        },
      })
  )
  .expectBadge({
    label: 'nexus',
    message: 'v1.2.3',
    color: 'blue',
  })

t.create('Nexus 2 - repository release version')
  .get(
    '/developer/ai.h2o/h2o-automl.json?server=https://repository.jboss.org/nexus'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/artifact/maven/resolve')
      .query({
        g: 'ai.h2o',
        a: 'h2o-automl',
        r: 'developer',
        v: 'LATEST',
      })
      .reply(200, {
        data: {
          version: '1.0.0',
        },
      })
  )
  .expectBadge({
    label: 'nexus',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('Nexus 2 - user query params')
  .get(
    '/fs-public-snapshots/com.progress.fuse/fusehq.json?queryOpt=:c=agent-apple-osx:p=tar.gz&server=https://repository.jboss.org/nexus'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/artifact/maven/resolve')
      .query({
        g: 'com.progress.fuse',
        a: 'fusehq',
        r: 'fs-public-snapshots',
        v: 'LATEST',
        c: 'agent-apple-osx',
        p: 'tar.gz',
      })
      .reply(200, {
        data: {
          version: '3.2.1',
        },
      })
  )
  .expectBadge({
    label: 'nexus',
    message: 'v3.2.1',
    color: 'blue',
  })

t.create('Nexus 3 - search release version valid artifact')
  .get(
    '/r/org.apache.commons/commons-lang3.json?server=https://nexus.pentaho.org&nexusVersion=3'
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create(
  'Nexus 3 - search release version valid artifact without explicit nexusVersion parameter'
)
  .timeout(15000)
  .get(
    '/r/org.apache.commons/commons-lang3.json?server=https://nexus.pentaho.org'
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('Nexus 3 - search release version of an nonexistent artifact')
  .get(
    '/r/org.apache.commons/nonexistent-artifact-id.json?server=https://nexus.pentaho.org&nexusVersion=3'
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact or version not found',
  })

t.create('Nexus 3 - search snapshot version valid snapshot artifact')
  .get(
    '/s/org.pentaho/pentaho-registry.json?server=https://nexus.pentaho.org&nexusVersion=3'
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('Nexus 3 - search snapshot version for artifact without snapshots')
  .get(
    '/s/javax.inject/javax.inject.json?server=https://nexus.pentaho.org&nexusVersion=3'
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact or snapshot version not found',
    color: 'red',
  })

t.create('Nexus 3 - repository version')
  .get(
    '/proxy-public-3rd-party-release/com.h2database/h2.json?server=https://nexus.pentaho.org&nexusVersion=3'
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create(
  'Nexus 3 - repository version valid artifact without explicit nexusVersion parameter'
)
  .timeout(15000)
  .get(
    '/proxy-public-3rd-party-release/com.h2database/h2.json?server=https://nexus.pentaho.org'
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('Nexus 3 - repository version with query')
  .get(
    `/proxy-public-3rd-party-release/org.junit.jupiter/junit-jupiter.json?server=https://nexus.pentaho.org&nexusVersion=3&queryOpt=${encodeURIComponent(
      ':maven.extension=jar:direction=asc'
    )}`
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('Nexus 3 - search release version without snapshots')
  .get(
    // Limit the version from above, so that any later artifacts don't break this test.
    `/r/org.pentaho.adaptive/pdi-engines.json?server=https://nexus.pentaho.org&nexusVersion=3&queryOpt=${encodeURIComponent(
      ':maven.baseVersion=<8.0.0.1'
    )}`
  )
  .expectBadge({
    label: 'nexus',
    message: 'v8.0.0.0-28',
  })
