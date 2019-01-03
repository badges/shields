'use strict'

const Joi = require('joi')
const sinon = require('sinon')

const { colorScheme } = require('../test-helpers')
const {
  isVPlusDottedVersionNClausesWithOptionalSuffix: isVersion,
} = require('../test-validators')
const t = (module.exports = require('../create-service-tester')())
const serverSecrets = require('../../lib/server-secrets')

const user = 'admin'
const pass = 'password'

function mockNexusCreds() {
  serverSecrets['nexus_user'] = undefined
  serverSecrets['nexus_pass'] = undefined
  sinon.stub(serverSecrets, 'nexus_user').value(user)
  sinon.stub(serverSecrets, 'nexus_pass').value(pass)
}

t.create('live: search release version valid artifact')
  .get('/r/https/repository.jboss.org/nexus/jboss/jboss-client.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nexus',
      value: isVersion,
    })
  )

t.create('live: search release version of an inexistent artifact')
  .get('/r/https/repository.jboss.org/nexus/jboss/inexistent-artifact-id.json')
  .expectJSON({
    name: 'nexus',
    value: 'artifact or version not found',
  })

t.create('live: search snapshot version valid snapshot artifact')
  .get('/s/https/repository.jboss.org/nexus/com.progress.fuse/fusehq.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nexus',
      value: isVersion,
    })
  )

t.create('live: search snapshot version of a release artifact')
  .get('/s/https/repository.jboss.org/nexus/jboss/jboss-client.json')
  .expectJSON({ name: 'nexus', value: 'no snapshot versions found' })

t.create('live: search snapshot version of an inexistent artifact')
  .get(
    '/s/https/repository.jboss.org/nexus/jboss/inexistent-artifact-id.json?style=_shields_test'
  )
  .expectJSON({
    name: 'nexus',
    value: 'artifact or version not found',
    colorB: colorScheme.red,
  })

t.create('live: repository version')
  .get('/developer/https/repository.jboss.org/nexus/ai.h2o/h2o-automl.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nexus',
      value: isVersion,
    })
  )

t.create('live: repository version with query')
  .get(
    '/fs-public-snapshots/https/repository.jboss.org/nexus/com.progress.fuse/fusehq:c=agent-apple-osx:p=tar.gz.json'
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nexus',
      value: isVersion,
    })
  )

t.create('live: repository version of an inexistent artifact')
  .get(
    '/developer/https/repository.jboss.org/nexus/jboss/inexistent-artifact-id.json'
  )
  .expectJSON({
    name: 'nexus',
    value: 'artifact not found',
  })

t.create('connection error')
  .get('/r/https/repository.jboss.org/nexus/jboss/jboss-client.json')
  .networkOff()
  .expectJSON({ name: 'nexus', value: 'inaccessible' })

t.create('search snapshot version not in latestSnapshot')
  .get(
    '/s/https/repository.jboss.org/nexus/com.progress.fuse/fusehq.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'com.progress.fuse', a: 'fusehq' })
      .reply(200, { data: [{ version: '7.0.1-SNAPSHOT' }] })
  )
  .expectJSON({
    name: 'nexus',
    value: 'v7.0.1-SNAPSHOT',
    colorB: colorScheme.orange,
  })

t.create('search snapshot no snapshot versions')
  .get(
    '/s/https/repository.jboss.org/nexus/com.progress.fuse/fusehq.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'com.progress.fuse', a: 'fusehq' })
      .reply(200, { data: [{ version: '1.2.3' }] })
  )
  .expectJSON({
    name: 'nexus',
    value: 'no snapshot versions found',
    colorB: colorScheme.lightgrey,
  })

t.create('search release version')
  .get(
    '/r/https/repository.jboss.org/nexus/jboss/jboss-client.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'jboss', a: 'jboss-client' })
      .reply(200, { data: [{ latestRelease: '1.0.0' }] })
  )
  .expectJSON({
    name: 'nexus',
    value: 'v1.0.0',
    colorB: colorScheme.blue,
  })

t.create('repository release version')
  .get(
    '/developer/https/repository.jboss.org/nexus/ai.h2o/h2o-automl.json?style=_shields_test'
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
  .expectJSON({
    name: 'nexus',
    value: 'v1.2.3',
    colorB: colorScheme.blue,
  })

t.create('repository release version')
  .get(
    '/developer/https/repository.jboss.org/nexus/ai.h2o/h2o-automl.json?style=_shields_test'
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
  .expectJSON({
    name: 'nexus',
    value: 'v1.0.0',
    colorB: colorScheme.blue,
  })

t.create('user query params')
  .get(
    '/fs-public-snapshots/https/repository.jboss.org/nexus/com.progress.fuse/fusehq:c=agent-apple-osx:p=tar.gz.json?style=_shields_test'
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
  .expectJSON({
    name: 'nexus',
    value: 'v3.2.1',
    colorB: colorScheme.blue,
  })

t.create('auth')
  .before(mockNexusCreds)
  .get(
    '/r/https/repository.jboss.org/nexus/jboss/jboss-client.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://repository.jboss.org/nexus')
      .get('/service/local/lucene/search')
      .query({ g: 'jboss', a: 'jboss-client' })
      // This ensures that the expected credentials from serverSecrets are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({
        user,
        pass,
      })
      .reply(200, { data: [{ latestRelease: '2.3.4' }] })
  )
  .finally(sinon.restore)
  .expectJSON({
    name: 'nexus',
    value: 'v2.3.4',
    colorB: colorScheme.blue,
  })
