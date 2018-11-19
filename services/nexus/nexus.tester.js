'use strict'

const Joi = require('joi')
const { invalidJSON } = require('../response-fixtures')

const t = require('../create-service-tester')()
module.exports = t

t.create('search release version')
  .get('/r/https/repository.jboss.org/nexus/jboss/jboss-client.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nexus',
      value: Joi.string().regex(/^v4(\.\d+)+$/),
    })
  )

t.create('search release version of an inexistent artifact')
  .get('/r/https/repository.jboss.org/nexus/jboss/inexistent-artifact-id.json')
  .expectJSON({ name: 'nexus', value: 'no-artifact' })

t.create('search snapshot version')
  .get('/s/https/repository.jboss.org/nexus/com.progress.fuse/fusehq.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nexus',
      value: Joi.string().regex(/-SNAPSHOT$/),
    })
  )

t.create('search snapshot version not in latestSnapshot')
  .get('/s/https/repository.jboss.org/nexus/com.progress.fuse/fusehq.json')
  .intercept(nock =>
    nock('https://repository.jboss.org')
      .get('/nexus/service/local/lucene/search')
      .query({ g: 'com.progress.fuse', a: 'fusehq' })
      .reply(200, '{ "data": [ { "version": "7.0.1-SNAPSHOT" } ] }')
  )
  .expectJSON({ name: 'nexus', value: 'v7.0.1-SNAPSHOT' })

t.create('search snapshot version of a release artifact')
  .get('/s/https/repository.jboss.org/nexus/jboss/jboss-client.json')
  .expectJSON({ name: 'nexus', value: 'undefined' })

t.create('search snapshot version of an inexistent artifact')
  .get('/s/https/repository.jboss.org/nexus/jboss/inexistent-artifact-id.json')
  .expectJSON({ name: 'nexus', value: 'no-artifact' })

t.create('resolve version')
  .get('/developer/https/repository.jboss.org/nexus/ai.h2o/h2o-automl.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nexus',
      value: Joi.string().regex(/^v3(\.\d+)+$/),
    })
  )

t.create('resolve version with query')
  .get(
    '/fs-public-snapshots/https/repository.jboss.org/nexus/com.progress.fuse/fusehq:c=agent-apple-osx:p=tar.gz.json'
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nexus',
      value: Joi.string().regex(/^v7(\.\d+)+-SNAPSHOT$/),
    })
  )

t.create('resolve version of an inexistent artifact')
  .get(
    '/developer/https/repository.jboss.org/nexus/jboss/inexistent-artifact-id.json'
  )
  .expectJSON({ name: 'nexus', value: 'no-artifact' })

t.create('connection error')
  .get('/r/https/repository.jboss.org/nexus/jboss/jboss-client.json')
  .networkOff()
  .expectJSON({ name: 'nexus', value: 'inaccessible' })

t.create('json parsing error')
  .get('/r/https/repository.jboss.org/nexus/jboss/jboss-client.json')
  .intercept(nock =>
    nock('https://repository.jboss.org')
      .get('/nexus/service/local/lucene/search')
      .query({ g: 'jboss', a: 'jboss-client' })
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'nexus', value: 'invalid' })
