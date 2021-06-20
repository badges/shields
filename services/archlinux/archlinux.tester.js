import { isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Arch Linux package (valid)')
  .get('/core/x86_64/pacman.json')
  .expectBadge({
    label: 'arch linux',
    message: isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  })

t.create('Arch Linux package (valid)')
  .get('/core/x86_64/pacman.json')
  .intercept(nock =>
    nock('https://www.archlinux.org')
      .get('/packages/core/x86_64/pacman/json/')
      .reply(200, {
        pkgname: 'pacman',
        pkgver: '5.1.3',
        pkgrel: '1',
      })
  )
  .expectBadge({ label: 'arch linux', message: 'v5.1.3' })

t.create('Arch Linux package (repository not found)')
  .get('/not-a-repository/x86_64/pacman.json')
  .expectBadge({ label: 'arch linux', message: 'not found' })

t.create('Arch Linux package (architecture not found)')
  .get('/core/not-an-architecture/pacman.json')
  .expectBadge({ label: 'arch linux', message: 'not found' })

t.create('Arch Linux package (not found)')
  .get('/core/x86_64/not-a-package.json')
  .expectBadge({ label: 'arch linux', message: 'not found' })
