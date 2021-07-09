import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Go version').get('/gohugoio/hugo.json').expectBadge({
  label: 'Go',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Go version (from branch)')
  .get('/gohugoio/hugo/master.json')
  .expectBadge({
    label: 'Go@master',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Go version (monorepo)')
  .get(`/golang/go.json?filename=${encodeURIComponent('src/go.mod')}`)
  .expectBadge({
    label: 'Go',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Go version (repo not found)')
  .get('/badges/not-existing-repo.json')
  .expectBadge({
    label: 'Go',
    message: 'repo not found, branch not found, or go.mod missing',
  })

t.create('Go version (missing Go version in go.mod)')
  .get('/calebcartwright/ci-detective.json')
  .expectBadge({
    label: 'Go',
    message: 'Go version missing in go.mod',
  })
