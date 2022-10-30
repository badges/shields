import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'CoverallsTestsRedirector',
  title: 'CoverallsTestsRedirector',
  pathPrefix: '/coveralls',
})

t.create('Coveralls VCS type missing')
  .get('/lemurheavy/coveralls-ruby.svg')
  .expectRedirect('/coverallsCoverage/github/lemurheavy/coveralls-ruby.svg')

t.create('Coveralls VCS type missing + specified branch')
  .get('/jekyll/jekyll/master.svg')
  .expectRedirect('/coverallsCoverage/github/jekyll/jekyll.svg?branch=master')

t.create('Redirect from before branch was a query param')
  .get('/bitbucket/pyKLIP/pyklip/master.svg')
  .expectRedirect(
    '/coverallsCoverage/bitbucket/pyKLIP/pyklip?branch=master.svg'
  )
