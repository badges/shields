'use strict'

const {
  isVPlusDottedVersionNClausesWithOptionalSuffix: isVersion,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('search release version valid artifact')
  .timeout(15000)
  .get('/r/https/oss.sonatype.org/com.google.guava/guava.json')
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('search release version of an nonexistent artifact')
  .timeout(10000)
  .get(
    '/r/https/oss.sonatype.org/com.google.guava/nonexistent-artifact-id.json'
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact or version not found',
  })

t.create('search snapshot version valid snapshot artifact')
  .timeout(10000)
  .get('/s/https/oss.sonatype.org/com.google.guava/guava.json')
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('search snapshot version of an nonexistent artifact')
  .timeout(10000)
  .get(
    '/s/https/oss.sonatype.org/com.google.guava/nonexistent-artifact-id.json'
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact or version not found',
    color: 'red',
  })

t.create('repository version')
  .get('/developer/https/repository.jboss.org/nexus/ai.h2o/h2o-automl.json')
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('repository version with query')
  .get(
    '/fs-public-snapshots/https/repository.jboss.org/nexus/com.progress.fuse/fusehq:c=agent-apple-osx:p=tar.gz.json'
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('repository version of an nonexistent artifact')
  .get(
    '/developer/https/repository.jboss.org/nexus/jboss/nonexistent-artifact-id.json'
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact not found',
  })

t.create('snapshot version with + in version')
  .get('/s/https/repository.jboss.org/nexus/com.progress.fuse/fusehq.json')
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

t.create('search snapshot version not in latestSnapshot')
  .get('/s/https/repository.jboss.org/nexus/com.progress.fuse/fusehq.json')
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

t.create('search snapshot no snapshot versions')
  .get('/s/https/repository.jboss.org/nexus/com.progress.fuse/fusehq.json')
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

t.create('search release version')
  .get('/r/https/repository.jboss.org/nexus/jboss/jboss-client.json')
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

t.create('repository release version')
  .get('/developer/https/repository.jboss.org/nexus/ai.h2o/h2o-automl.json')
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

t.create('repository release version')
  .get('/developer/https/repository.jboss.org/nexus/ai.h2o/h2o-automl.json')
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

t.create('user query params')
  .get(
    '/fs-public-snapshots/https/repository.jboss.org/nexus/com.progress.fuse/fusehq:c=agent-apple-osx:p=tar.gz.json'
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
