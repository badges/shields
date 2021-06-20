import { nonNegativeInteger } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('renders correctly')
  .get('/shields.json')
  .intercept(nock =>
    nock('https://opencollective.com/').get('/shields.json').reply(200, {
      slug: 'shields',
      currency: 'USD',
      image:
        'https://opencollective-production.s3-us-west-1.amazonaws.com/44dcbb90-1ee9-11e8-a4c3-7bb1885c0b6e.png',
      balance: 105494,
      yearlyIncome: 157371,
      backersCount: 35,
      contributorsCount: 276,
    })
  )
  .expectBadge({
    label: 'backers and sponsors',
    message: '35',
    color: 'brightgreen',
  })
t.create('gets amount of backers and sponsors')
  .get('/shields.json')
  .expectBadge({
    label: 'backers and sponsors',
    message: nonNegativeInteger,
  })

t.create('renders not found correctly')
  .get('/nonexistent-collective.json')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/nonexistent-collective.json')
      .reply(404, 'Not found')
  )
  .expectBadge({
    label: 'backers and sponsors',
    message: 'collective not found',
    color: 'red',
  })

t.create('handles not found correctly')
  .get('/nonexistent-collective.json')
  .expectBadge({
    label: 'backers and sponsors',
    message: 'collective not found',
    color: 'red',
  })
