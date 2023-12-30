import { licenseToColor } from '../licenses.js'
import { createServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import _noGitLabToken from './gitlab-license.service.js'
export const t = await createServiceTester()
const noGitLabToken = noToken(_noGitLabToken)

const publicDomainLicenseColor = licenseToColor('MIT License')
const unknownLicenseColor = licenseToColor()

t.create('License')
  .get('/guoxudong.io/shields-test/licenced-test.json')
  .expectBadge({
    label: 'license',
    message: 'MIT License',
    color: `${publicDomainLicenseColor}`,
  })

t.create('License for repo without a license')
  .get('/guoxudong.io/shields-test/no-license-test.json')
  .expectBadge({
    label: 'license',
    message: 'not specified',
    color: 'lightgrey',
  })

t.create('Other license')
  .get('/group/project.json')
  .intercept(nock =>
    nock('https://gitlab.com')
      .get('/api/v4/projects/group%2Fproject?license=1')
      .reply(200, {
        license: {
          name: 'Other',
        },
      }),
  )
  .expectBadge({
    label: 'license',
    message: 'Other',
    color: unknownLicenseColor,
  })

t.create('License for unknown repo')
  .get('/user1/gitlab-does-not-have-this-repo.json')
  .expectBadge({
    label: 'license',
    message: 'project not found',
    color: 'red',
  })

t.create('Mocking License')
  .get('/group/project.json')
  .intercept(nock =>
    nock('https://gitlab.com')
      .get('/api/v4/projects/group%2Fproject?license=1')
      .reply(200, {
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          nickname: '',
          html_url: 'http://choosealicense.com/licenses/apache-2.0/',
          source_url: '',
        },
      }),
  )
  .expectBadge({
    label: 'license',
    message: 'Apache License 2.0',
    color: unknownLicenseColor,
  })

t.create('License (private repo)')
  .skipWhen(noGitLabToken)
  .get('/shields-ops-group/test.json')
  .expectBadge({
    label: 'license',
    message: 'MIT License',
    color: `${publicDomainLicenseColor}`,
  })
