import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create(
  'redirect supported django versions (valid, package version in request)'
)
  .get('/djangorestframework/3.7.3.json')
  .expectRedirect(
    '/pypi/frameworkversions/Django/djangorestframework/3.7.3.json'
  )

t.create(
  'redirect supported django versions (valid, no package version specified)'
)
  .get('/djangorestframework.json')
  .expectRedirect('/pypi/frameworkversions/Django/djangorestframework.json')

t.create('redirect supported django versions (no versions specified)')
  .get('/django/1.11.json')
  .expectRedirect('/pypi/frameworkversions/Django/django/1.11.json')

t.create('redirect supported django versions (invalid)')
  .get('/not-a-package.json')
  .expectRedirect('/pypi/frameworkversions/Django/not-a-package.json')
