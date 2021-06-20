import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('hackage version (valid)').get('/lens.json').expectBadge({
  label: 'hackage',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('hackage version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'hackage', message: 'not found' })

t.create('hackage version (unexpected response)')
  .get('/lens.json')
  .intercept(nock =>
    nock('https://hackage.haskell.org')
      .get('/package/lens/lens.cabal')
      .reply(200, '')
  )
  .expectBadge({ label: 'hackage', message: 'invalid response data' })
