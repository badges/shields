import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'CodeclimateCoverageRedirector',
  title: 'Code Climate Coverage Redirector',
  pathPrefix: '/codeclimate',
})

t.create('Top-level coverage shortcut')
  .get('/jekyll/jekyll.svg')
  .expectRedirect('/codeclimate/coverage/jekyll/jekyll.svg')

t.create('Coverage shortcut')
  .get('/c/jekyll/jekyll.svg')
  .expectRedirect('/codeclimate/coverage/jekyll/jekyll.svg')

t.create('Coverage letter shortcut')
  .get('/c-letter/jekyll/jekyll.svg')
  .expectRedirect('/codeclimate/coverage-letter/jekyll/jekyll.svg')

t.create('Coverage percentage shortcut')
  .get('/coverage-percentage/jekyll/jekyll.svg')
  .expectRedirect('/codeclimate/coverage/jekyll/jekyll.svg')
