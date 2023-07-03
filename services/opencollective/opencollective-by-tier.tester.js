import { nonNegativeInteger } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('renders correctly')
  .get('/shields/2988.json')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/shields/members/all.json?TierId=2988')
      .reply(200, [
        {
          MemberId: 10756,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 13507,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 16326,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 16420,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 19279,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 21482,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 26367,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 29443,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'monthly backer',
        },
      ])
  )
  .expectBadge({
    label: 'monthly backers',
    message: '8',
    color: 'brightgreen',
  })

// Not ideal, but open collective only returns an empty array
t.create('shows 0 when given a non existent tier')
  .get('/shields/1234567890.json')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/shields/members/all.json?TierId=1234567890')
      .reply(200, [])
  )
  .expectBadge({
    label: 'new tier',
    message: '0',
    color: 'lightgrey',
  })

t.create('gets amount of backers in specified tier')
  .get('/shields/2988.json')
  .expectBadge({
    label: 'monthly backers',
    message: nonNegativeInteger,
  })

t.create('handles not found correctly')
  .get('/nonexistent-collective/1234.json')
  .expectBadge({
    label: 'open collective',
    message: 'collective not found',
    color: 'red',
  })
