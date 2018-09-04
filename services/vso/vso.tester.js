'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isBuildStatus } = require('../test-validators')

const t = new ServiceTester({
  id: 'vso',
  title: 'Visual Studio Team Services',
})
module.exports = t

// Builds

t.create('build status on default branch')
  .get('/build/devdiv/0bdbc590-a062-4c3f-b0f6-9383f67865ee/7716.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('build status on named branch')
  .get('/build/devdiv/0bdbc590-a062-4c3f-b0f6-9383f67865ee/7716/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('build status on unknown repo')
  .get('/build/this-repo/does-not/exist.json')
  .expectJSON({ name: 'build', value: 'inaccessible' })

t.create('build status with connection error')
  .get('/build/foo/bar/foobar.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' })

// Releases

t.create('release status is succeeded')
  .get('/release/devdiv/0bdbc590-a062-4c3f-b0f6-9383f67865ee/77/16.json')
  .intercept(nock =>
    nock('https://devdiv.vsrm.visualstudio.com')
      .get(
        '/_apis/public/release/badge/0bdbc590-a062-4c3f-b0f6-9383f67865ee/77/16'
      )
      .reply(200, '<svg><g><text>succeeded</text></g></svg>')
  )
  .expectJSON({ name: 'deployment', value: 'passing' })

t.create('release status is partially succeeded')
  .get('/release/devdiv/0bdbc590-a062-4c3f-b0f6-9383f67865ee/77/16.json')
  .intercept(nock =>
    nock('https://devdiv.vsrm.visualstudio.com')
      .get(
        '/_apis/public/release/badge/0bdbc590-a062-4c3f-b0f6-9383f67865ee/77/16'
      )
      .reply(200, '<svg><g><text>partially succeeded</text></g></svg>')
  )
  .expectJSON({ name: 'deployment', value: 'passing' })

t.create('release status is failed')
  .get('/release/devdiv/0bdbc590-a062-4c3f-b0f6-9383f67865ee/77/16.json')
  .intercept(nock =>
    nock('https://devdiv.vsrm.visualstudio.com')
      .get(
        '/_apis/public/release/badge/0bdbc590-a062-4c3f-b0f6-9383f67865ee/77/16'
      )
      .reply(200, '<svg><g><text>failed</text></g></svg>')
  )
  .expectJSON({ name: 'deployment', value: 'failing' })

t.create('release status on unknown repo')
  .get('/release/this-repo/does-not-exist/1/2.json')
  .expectJSON({ name: 'deployment', value: 'inaccessible' })

t.create('release status with connection error')
  .get('/release/foo/bar/1/2.json')
  .networkOff()
  .expectJSON({ name: 'deployment', value: 'inaccessible' })
