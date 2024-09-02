import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'osslifecycle',
  title: 'OSS Lifecycle',
})

t.create('osslifecycle active status')
  .get(
    '.json?file_url=https://raw.githubusercontent.com/Netflix/sureal/HEAD/OSSMETADATA',
  )
  .expectBadge({
    label: 'oss lifecycle',
    message: 'active',
    color: 'brightgreen',
  })

t.create('osslifecycle maintenance status')
  .get(
    '.json?file_url=https://raw.githubusercontent.com/Teevity/ice/HEAD/OSSMETADATA',
  )
  .expectBadge({
    label: 'oss lifecycle',
    message: 'maintenance',
    color: 'yellow',
  })

t.create('osslifecycle archived status')
  .get(
    '.json?file_url=https://raw.githubusercontent.com/Netflix/rx-aws-java-sdk/HEAD/OSSMETADATA',
  )
  .expectBadge({
    label: 'oss lifecycle',
    message: 'archived',
    color: 'red',
  })

t.create('osslifecycle other status')
  .get(
    '.json?file_url=https://raw.githubusercontent.com/Netflix/metacat/HEAD/OSSMETADATA',
  )
  .expectBadge({
    label: 'oss lifecycle',
    message: 'private',
    color: 'lightgrey',
  })

t.create('oss metadata in unexpected format')
  .get(
    '.json?file_url=https://raw.githubusercontent.com/some-user/some-project/HEAD/OSSMETADATA',
  )
  .intercept(
    nock =>
      nock('https://raw.githubusercontent.com')
        .get('/some-user/some-project/HEAD/OSSMETADATA')
        .reply(200, 'wrongkey=active'),
    {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  )
  .expectBadge({
    label: 'oss lifecycle',
    message: 'metadata in unexpected format',
  })

t.create('oss metadata not found')
  .get(
    '.json?file_url=https://raw.githubusercontent.com/PyvesB/empty-repo/HEAD/OSSMETADATA',
  )
  .expectBadge({
    label: 'oss lifecycle',
    message: 'not found',
  })
