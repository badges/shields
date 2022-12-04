import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('passes api key as header')
  .get('/github/infracost/infracost/main.json?badgeToken=test')
  .intercept(nock =>
    nock('https://dashboard.api.infracost.io', {
      reqheaders: {
        'X-Badge-Token': 'test',
      },
    })
      .get('/shields/repos/github/infracost/infracost/branch/main')
      .reply(200, { cost: '$50' })
  )
  .expectBadge({
    label: 'monthly cost',
    message: '$50',
    color: 'purple',
  })

t.create('mock valid repo request')
  .get('/github/infracost/infracost/main.json?badgeToken=test')
  .intercept(nock =>
    nock('https://dashboard.api.infracost.io')
      .get('/shields/repos/github/infracost/infracost/branch/main')
      .reply(200, { cost: '$50' })
  )
  .expectBadge({
    label: 'monthly cost',
    message: '$50',
    color: 'purple',
  })

t.create('mock valid project request')
  .get(
    '/github/infracost/infracost/main.json?badgeToken=test&projectName=projecttest'
  )
  .intercept(nock =>
    nock('https://dashboard.api.infracost.io')
      .get('/shields/repos/github/infracost/infracost/branch/main')
      .query({ projectName: 'projecttest' })
      .reply(200, { cost: '$70' })
  )
  .expectBadge({
    label: 'monthly cost',
    message: '$70',
    color: 'purple',
  })

t.create('mock invalid repo request')
  .get('/github/infracost/infracost/main.json?badgeToken=test')
  .intercept(nock =>
    nock('https://dashboard.api.infracost.io')
      .get('/shields/repos/github/infracost/infracost/branch/main')
      .reply(404)
  )
  .expectBadge({
    label: 'monthly cost',
    message:
      'could not find a cost estimate, please make sure you have a run for this repository stored in Infracost Cloud.',
    color: 'red',
  })

t.create('mock invalid repo request')
  .get('/github/infracost/infracost/main.json?badgeToken=test')
  .intercept(nock =>
    nock('https://dashboard.api.infracost.io')
      .get('/shields/repos/github/infracost/infracost/branch/main')
      .reply(401)
  )
  .expectBadge({
    label: 'monthly cost',
    message: 'invalid Infracost badge token',
  })
