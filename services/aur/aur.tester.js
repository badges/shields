import { ServiceTester } from '../tester.js'
import {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
  isMetric,
  isFormattedDate,
} from '../test-validators.js'

export const t = new ServiceTester({
  id: 'aur',
  title: 'Arch Linux AUR',
})

// version tests

t.create('version (valid)')
  .get('/version/visual-studio-code-bin.json')
  .expectBadge({
    label: 'aur',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
    color: 'blue',
  })

t.create('version (not found)')
  .get('/version/not-a-package.json')
  .expectBadge({ label: 'aur', message: 'package not found' })

// votes tests

t.create('votes (valid)').get('/votes/google-chrome.json').expectBadge({
  label: 'votes',
  message: isMetric,
})

t.create('votes (not found)')
  .get('/votes/not-a-package.json')
  .expectBadge({ label: 'votes', message: 'package not found' })

// license tests

t.create('license (valid)')
  .get('/license/vscodium-bin.json')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('license (no license)')
  .get('/license/vscodium-bin.json')
  .intercept(nock =>
    nock('https://aur.archlinux.org')
      .get('/rpc')
      .query({
        v: 5,
        type: 'info',
        arg: 'vscodium-bin',
      })
      .reply(200, {
        resultcount: 1,
        results: [
          {
            License: null,
            NumVotes: 1,
            Version: '1',
            OutOfDate: null,
            Maintainer: null,
            LastModified: 1,
          },
        ],
      })
  )
  .expectBadge({ label: 'license', message: 'not specified' })

t.create('license (package not found)')
  .get('/license/not-a-package.json')
  .expectBadge({ label: 'license', message: 'package not found' })

// maintainer tests

t.create('maintainer (valid)')
  .get('/maintainer/google-chrome.json')
  .expectBadge({ label: 'maintainer', message: 'luzifer' })

t.create('maintainer (not found)')
  .get('/maintainer/not-a-package.json')
  .expectBadge({ label: 'maintainer', message: 'package not found' })

// last-modified tests

t.create('last-modified (valid)')
  .get('/last-modified/google-chrome.json')
  .expectBadge({ label: 'last modified', message: isFormattedDate })

t.create('last-modified (not found)')
  .get('/last-modified/not-a-package.json')
  .expectBadge({ label: 'last modified', message: 'package not found' })
