import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'ClojarsVersion',
  title: 'Clojars Version',
  pathPrefix: '/clojars',
})

t.create('clojars version (valid)')
  .get('/v/prismic.json')
  .expectBadge({
    label: 'clojars',
    message: /^\[prismic "([0-9][.]?)+"\]$/, // note: https://github.com/badges/shields/pull/431
  })

t.create('clojars version (pre) (valid)')
  .get('/v/prismic.json?include_prereleases')
  .expectBadge({
    label: 'clojars',
    message: /^\[prismic "([0-9][.]?)+"\]$/, // note: https://github.com/badges/shields/pull/431
  })

t.create('clojars version (not found)')
  .get('/v/not-a-package.json')
  .expectBadge({ label: 'clojars', message: 'not found' })

t.create('version (legacy redirect: vpre)')
  .get('/vpre/prismic.svg')
  .expectRedirect('/clojars/v/prismic.svg?include_prereleases')
