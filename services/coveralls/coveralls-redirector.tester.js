import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'CoverallsGitHubRedirect',
  title: 'Coveralls GitHub Redirector',
  pathPrefix: '/coveralls',
})

t.create('Coveralls VCS type missing')
  .get('/lemurheavy/coveralls-ruby.svg')
  .expectRedirect('/coveralls/github/lemurheavy/coveralls-ruby.svg')
