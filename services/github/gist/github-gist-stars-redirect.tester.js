import { ServiceTester } from '../../tester.js'
export const t = new ServiceTester({
  id: 'GistStarsRedirect',
  title: 'Github Gist Stars Redirect',
  pathPrefix: '/github',
})

t.create('Stars redirect')
  .get('/stars/gists/a8b8c979d200ffde13cc08505f7a6436', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/github/gist/stars/a8b8c979d200ffde13cc08505f7a6436.svg',
  )
