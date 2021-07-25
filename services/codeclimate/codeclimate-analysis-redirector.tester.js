import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'CodeclimateCoverageRedirector',
  title: 'Code Climate Coverage Redirector',
  pathPrefix: '/codeclimate',
})

t.create('Maintainability letter alias')
  .get('/maintainability-letter/jekyll/jekyll.svg')
  .expectRedirect('/codeclimate/maintainability/jekyll/jekyll.svg')
