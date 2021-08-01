import { isMetric } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubSponsors',
  title: 'Github Sponsors',
  pathPrefix: '/github',
})

t.create('Sponsors').get('/sponsors/Homebrew.json').expectBadge({
  label: 'sponsors',
  message: isMetric,
  color: 'blue',
})

t.create('Sponsors (user not found)')
  .get('/sponsors/badges-non-exist.json')
  .expectBadge({
    label: 'sponsors',
    message: 'user/org not found',
  })
