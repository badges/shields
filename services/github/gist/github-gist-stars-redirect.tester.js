import { ServiceTester } from '../../tester.js'
export const t = new ServiceTester({
  id: 'GistStarsRedirect',
  title: 'Github Gist Stars Redirect',
  pathPrefix: '/github',
})

t.create('Stars deprecated')
  .get('/stars/gists/a8b8c979d200ffde13cc08505f7a6436.json')
  .expectBadge({
    label: 'github',
    message: 'https://github.com/badges/shields/pull/11583',
  })
