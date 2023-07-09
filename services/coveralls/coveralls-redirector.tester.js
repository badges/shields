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

t.create(
  'Redirect from before branch was a query param - github, with specified branch',
)
  .get('/github/jekyll/jekyll/master.svg')
  .expectRedirect('/coverallsCoverage/github/jekyll/jekyll.svg?branch=master')

t.create(
  'Redirect from before branch was a query param - github, without specified branch',
)
  .get('/github/badges/shields')
  .expectRedirect('/coverallsCoverage/github/badges/shields.svg')

t.create(
  'Redirect from before branch was a query param - bitbucket, with specified branch',
)
  .get('/bitbucket/pyKLIP/pyklip/master.svg')
  .expectRedirect(
    '/coverallsCoverage/bitbucket/pyKLIP/pyklip.svg?branch=master',
  )

t.create(
  'Redirect from before branch was a query param - bitbucket, without specified branch',
)
  .get('/bitbucket/pyKLIP/pyklip.svg')
  .expectRedirect('/coverallsCoverage/bitbucket/pyKLIP/pyklip.svg')
