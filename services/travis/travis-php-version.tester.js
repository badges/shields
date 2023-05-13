import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'TravisPhpVersion',
  title: 'TravisPhpVersion',
  pathPrefix: '/travis/php-v',
})

t.create('travis php version, deprecated')
  .get('/symfony/symfony/5.1.json')
  .expectBadge({ label: 'php', message: 'no longer available' })
