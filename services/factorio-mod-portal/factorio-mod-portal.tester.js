import { isComposerVersion, withRegex } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'factorio-mod-portal',
  title: 'Factorio Mod Portal',
})

const multipleVersions = withRegex(/^([+]?\d*\.\d+)(-)([+]?\d*\.\d+)$/)

t.create('Latest Version (rso-mod, valid)')
  .get('/lv/rso-mod.json')
  .expectBadge({ label: 'latest version', message: isComposerVersion })

t.create('Latest Version (mod not found)')
  .get('/lv/mod-that-doesnt-exist.json')
  .expectBadge({ label: 'latest version', message: 'mod not found' })

t.create('Factorio Versions (rso-mod, valid)')
  .get('/fv/rso-mod.json')
  .expectBadge({ label: 'factorio version', message: multipleVersions })

t.create('Factorio Versions (mod not found)')
  .get('/fv/mod-that-doesnt-exist.json')
  .expectBadge({ label: 'factorio version', message: 'mod not found' })
