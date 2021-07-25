import { licenseToColor } from '../licenses.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const publicDomainLicenseColor = licenseToColor('CC0-1.0')
const unknownLicenseColor = licenseToColor()

t.create('License')
  .get('/github/gitignore.json')
  .expectBadge({
    label: 'license',
    message: 'CC0-1.0',
    color: `#${publicDomainLicenseColor}`,
  })

t.create('License for repo without a license')
  .get('/badges/badger.json')
  .expectBadge({
    label: 'license',
    message: 'not specified',
    color: 'lightgrey',
  })

t.create('License for repo with an unrecognized license')
  .get('/philokev/sopel-noblerealms.json')
  .expectBadge({
    label: 'license',
    message: 'not identifiable by github',
    color: unknownLicenseColor,
  })

t.create('License with SPDX id not appearing in configuration')
  .get('/user1/project-with-EFL-license.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user1/project-with-EFL-license')
      .query(true)
      // GitHub API currently returns "other" as a key for repo with EFL license
      .reply(200, {
        license: {
          key: 'efl-1.0',
          name: 'Eiffel Forum License v1.0',
          spdx_id: 'EFL-1.0',
          url: 'https://api.github.com/licenses/efl-1.0',
          featured: true,
        },
      })
  )
  .expectBadge({
    label: 'license',
    message: 'EFL-1.0',
    color: unknownLicenseColor,
  })

t.create('License for unknown repo')
  .get('/user1/github-does-not-have-this-repo.json')
  .expectBadge({
    label: 'license',
    message: 'repo not found',
    color: 'red',
  })
