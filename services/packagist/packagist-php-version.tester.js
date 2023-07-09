import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create(
  'redirect getting required php version for the dependency from packagist (valid, package version not specified in request)',
)
  .get('/symfony/symfony.json')
  .expectRedirect('/packagist/dependency-v/symfony/symfony/php.json?')

t.create(
  'redirect getting required php version for the dependency from packagist (valid, package version specified in request)',
)
  .get('/symfony/symfony/v3.2.8.json')
  .expectRedirect(
    '/packagist/dependency-v/symfony/symfony/php.json?version=v3.2.8',
  )

t.create(
  'redirect getting required php version for the dependency from packagist (valid, package version and server specified in request)',
)
  .get('/symfony/symfony/v3.2.8.json?server=https://packagist.org')
  .expectRedirect(
    '/packagist/dependency-v/symfony/symfony/php.json?server=https%3A%2F%2Fpackagist.org&version=v3.2.8',
  )
