'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'osslifecycle',
  title: 'OSS Lifecycle',
}))

t.create('osslifecycle status')
  .get('/Netflix/osstracker.json')
  .expectJSON({
    name: 'oss lifecycle',
    value: 'active',
  })

t.create('osslifecycle status (branch)')
  .get('/Netflix/osstracker/documentation.json')
  .expectJSON({
    name: 'oss lifecycle',
    value: 'active',
  })

t.create('oss metadata in unexpected format')
  .get('/some-user/some-project.json')
  .intercept(
    nock =>
      nock('https://raw.githubusercontent.com')
        .get('/some-user/some-project/master/OSSMETADATA')
        .reply(200, `wrongkey=active`),
    {
      'Content-Type': 'text/plain;charset=UTF-8',
    }
  )
  .expectJSON({
    name: 'oss lifecycle',
    value: 'metadata in unexpected format',
  })

t.create('oss metadata not found')
  .get('/PyvesB/empty-repo.json')
  .expectJSON({
    name: 'oss lifecycle',
    value: 'not found',
  })
