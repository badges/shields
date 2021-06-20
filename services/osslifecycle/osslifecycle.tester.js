import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'osslifecycle',
  title: 'OSS Lifecycle',
})

t.create('osslifecycle active status').get('/netflix/sureal.json').expectBadge({
  label: 'oss lifecycle',
  message: 'active',
  color: 'brightgreen',
})

t.create('osslifecycle maintenance status')
  .get('/Teevity/ice.json')
  .expectBadge({
    label: 'oss lifecycle',
    message: 'maintenance',
    color: 'yellow',
  })

t.create('osslifecycle archived status')
  .get('/Netflix/rx-aws-java-sdk.json')
  .expectBadge({
    label: 'oss lifecycle',
    message: 'archived',
    color: 'red',
  })

t.create('osslifecycle other status').get('/Netflix/metacat.json').expectBadge({
  label: 'oss lifecycle',
  message: 'private',
  color: 'lightgrey',
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
        .get('/some-user/some-project/HEAD/OSSMETADATA')
        .reply(200, `wrongkey=active`),
    {
      'Content-Type': 'text/plain;charset=UTF-8',
    }
  )
  .expectBadge({
    label: 'oss lifecycle',
    message: 'metadata in unexpected format',
  })

t.create('oss metadata not found').get('/PyvesB/empty-repo.json').expectBadge({
  label: 'oss lifecycle',
  message: 'not found',
})
