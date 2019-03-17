'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'osslifecycle',
  title: 'OSS Lifecycle',
}))

t.create('osslifecycle status')
  .get('/Netflix/osstracker.json')
  .expectBadge({
    label: 'oss lifecycle',
    message: 'active',
  })

t.create('osslifecycle status (branch)')
  .get('/Netflix/osstracker/documentation.json')
  .expectBadge({
    label: 'oss lifecycle',
    message: 'active',
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
  .expectBadge({
    label: 'oss lifecycle',
    message: 'metadata in unexpected format',
  })

t.create('oss metadata not found')
  .get('/PyvesB/empty-repo.json')
  .expectBadge({
    label: 'oss lifecycle',
    message: 'not found',
  })
