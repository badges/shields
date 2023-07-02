import { nonNegativeInteger } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets amount of backers and sponsors')
  .get('/shields.json')
  .expectBadge({
    label: 'backers and sponsors',
    message: nonNegativeInteger,
  })

t.create('renders not found correctly')
  .get('/nonexistent-collective.json')
  .intercept(nock =>
    nock('https://api.opencollective.com/graphql/v2')
      .post('')
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
    message: 'No collective found with slug nonexistent-collective',
    color: 'lightgrey',
  })
