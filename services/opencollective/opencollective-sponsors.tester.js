import { nonNegativeInteger } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('renders correctly')
  .get('/shields.json')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/shields/members/organizations.json')
      .reply(200, [
        { MemberId: 8683, type: 'ORGANIZATION', role: 'HOST' },
        {
          MemberId: 13484,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'backer',
        },
        { MemberId: 13508, type: 'ORGANIZATION', role: 'FUNDRAISER' },
        { MemberId: 15987, type: 'ORGANIZATION', role: 'BACKER' },
        {
          MemberId: 16561,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'sponsor',
        },
        {
          MemberId: 16469,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'sponsor',
        },
        {
          MemberId: 18162,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'sponsor',
        },
        {
          MemberId: 21023,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'sponsor',
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
        { MemberId: 27531, type: 'ORGANIZATION', role: 'BACKER' },
        {
          MemberId: 29443,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'monthly backer',
        },
      ])
  )
  .expectBadge({
    label: 'sponsors',
    message: '10',
    color: 'brightgreen',
  })
t.create('gets amount of sponsors').get('/shields.json').expectBadge({
  label: 'sponsors',
  message: nonNegativeInteger,
})

t.create('handles not found correctly')
  .get('/nonexistent-collective.json')
  .expectBadge({
    label: 'sponsors',
    message: 'collective not found',
    color: 'red',
  })
