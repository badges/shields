import { ServiceTester } from '../../tester.js'

export const t = new ServiceTester({
  id: 'GistLastCommitRedirect',
  title: 'GitHub Gist Last Commit Redirect',
  pathPrefix: '/github-gist',
})

t.create('Last Commit redirect')
  .get('/last-commit/a8b8c979d200ffde13cc08505f7a6436', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/github/gist/last-commit/a8b8c979d200ffde13cc08505f7a6436.svg',
  )
