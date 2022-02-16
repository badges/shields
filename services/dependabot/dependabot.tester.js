import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'dependabot',
  title: 'Dependabot',
})

t.create('no longer available (previously semver stability)')
  .get('/semver/bundler/puma.json')
  .expectBadge({
    label: 'dependabot',
    message: 'no longer available',
  })
