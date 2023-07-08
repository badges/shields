import { nonNegativeInteger } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('renders correctly')
  .get('/shields.json')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/shields/members/users.json')
      .reply(200, [
        { MemberId: 8685, type: 'USER', role: 'ADMIN' },
        { MemberId: 8686, type: 'USER', role: 'ADMIN' },
        { MemberId: 8682, type: 'USER', role: 'ADMIN' },
        { MemberId: 10305, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 10396, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 10733, type: 'USER', role: 'BACKER' },
        { MemberId: 8684, type: 'USER', role: 'ADMIN' },
        { MemberId: 10741, type: 'USER', role: 'BACKER' },
        {
          MemberId: 10756,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        { MemberId: 11578, type: 'USER', role: 'CONTRIBUTOR' },
        { MemberId: 13459, type: 'USER', role: 'CONTRIBUTOR' },
        {
          MemberId: 13507,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        { MemberId: 13512, type: 'USER', role: 'BACKER' },
        { MemberId: 13513, type: 'USER', role: 'FUNDRAISER' },
        { MemberId: 13984, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 14916, type: 'USER', role: 'BACKER' },
        {
          MemberId: 16326,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        { MemberId: 18252, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 17631, type: 'USER', role: 'BACKER', tier: 'backer' },
        {
          MemberId: 16420,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        { MemberId: 17186, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 18791, type: 'USER', role: 'BACKER', tier: 'backer' },
        {
          MemberId: 19279,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        { MemberId: 19863, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 21451, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 22718, type: 'USER', role: 'BACKER' },
        { MemberId: 23561, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 25092, type: 'USER', role: 'CONTRIBUTOR' },
        { MemberId: 24473, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 25439, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 24483, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 25090, type: 'USER', role: 'CONTRIBUTOR' },
        { MemberId: 26404, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 27026, type: 'USER', role: 'BACKER', tier: 'backer' },
        { MemberId: 27132, type: 'USER', role: 'CONTRIBUTOR' },
      ])
  )
  .expectBadge({
    label: 'backers',
    message: '25',
    color: 'brightgreen',
  })

t.create('gets amount of backers').get('/shields.json').expectBadge({
  label: 'backers',
  message: nonNegativeInteger,
})

t.create('handles not found correctly')
  .get('/nonexistent-collective.json')
  .expectBadge({
    label: 'backers',
    message: 'collective not found',
    color: 'red',
  })
