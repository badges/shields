'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const {
  isMetric,
  isMetricOpenIssues,
  isMetricOverTimePeriod,
  isFileSize,
  isFormattedDate,
  isVPlusDottedVersionAtLeastOne,
} = require('../test-validators')
const colorscheme = require('../../lib/colorscheme.json')
const { licenseToColor } = require('../../lib/licenses')
const { makeColor } = require('../../lib/badge-data')
const mapValues = require('lodash.mapvalues')
const { invalidJSON } = require('../response-fixtures')

const t = new ServiceTester({ id: 'github', title: 'Github' })
module.exports = t
const colorsB = mapValues(colorscheme, 'colorB')
const publicDomainLicenseColor = makeColor(licenseToColor('CC0-1.0'))
const permissiveLicenseColor = colorsB[licenseToColor('MIT')]
const copyleftLicenseColor = colorsB[licenseToColor('GPL-3.0')]
const unknownLicenseColor = colorsB[licenseToColor()]

t.create('Public domain license')
  .get('/license/github/gitignore.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'CC0-1.0',
    colorB: publicDomainLicenseColor,
  })

t.create('Copyleft license')
  .get('/license/ansible/ansible.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'GPL-3.0',
    colorB: copyleftLicenseColor,
  })

t.create('Permissive license')
  .get('/license/atom/atom.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'MIT', colorB: permissiveLicenseColor })

t.create('License for repo without a license')
  .get('/license/badges/badger.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'missing', colorB: colorsB.red })

t.create('License for repo with an unrecognized license')
  .get('/license/philokev/sopel-noblerealms.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'unknown',
    colorB: unknownLicenseColor,
  })

t.create('License with SPDX id not appearing in configuration')
  .get('/license/user1/project-with-EFL-license.json?style=_shields_test')
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
  .expectJSON({
    name: 'license',
    value: 'EFL-1.0',
    colorB: unknownLicenseColor,
  })

t.create('License for unknown repo')
  .get('/license/user1/github-does-not-have-this-repo.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'repo not found',
    colorB: colorsB.lightgrey,
  })

t.create('License - API rate limit exceeded')
  .get('/license/user1/repo1.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user1/repo1')
      .query(true)
      .reply(403, {
        message:
          "API rate limit exceeded for 123.123.123.123. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)",
        documentation_url: 'https://developer.github.com/v3/#rate-limiting',
      })
  )
  .expectJSON({ name: 'license', value: 'invalid', colorB: colorsB.lightgrey })

t.create('Contributors')
  .get('/contributors/cdnjs/cdnjs.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'contributors',
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Contributors (repo not found)')
  .get('/contributors/badges/helmets.json')
  .expectJSON({
    name: 'contributors',
    value: 'repo not found',
  })

t.create('GitHub closed pull requests')
  .get('/issues-pr-closed/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pull requests',
      value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? closed$/),
    })
  )

t.create('GitHub closed pull requests raw')
  .get('/issues-pr-closed-raw/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'closed pull requests',
      value: Joi.string().regex(/^\w+?$/),
    })
  )

t.create('GitHub pull requests')
  .get('/issues-pr/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pull requests',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub pull requests raw')
  .get('/issues-pr-raw/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'open pull requests',
      value: isMetric,
    })
  )

t.create('GitHub closed issues')
  .get('/issues-closed/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'issues',
      value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? closed$/),
    })
  )

t.create('GitHub closed issues raw')
  .get('/issues-closed-raw/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'closed issues',
      value: Joi.string().regex(/^\w+\+?$/),
    })
  )

t.create('GitHub open issues')
  .get('/issues/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'issues',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub open issues raw')
  .get('/issues-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({ name: 'open issues', value: isMetric }))

t.create('GitHub open issues by label is > zero')
  .get('/issues/badges/shields/service-badge.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'service-badge issues',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub open issues by multi-word label is > zero')
  .get('/issues/Cockatrice/Cockatrice/App%20-%20Cockatrice.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: '"App - Cockatrice" issues',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub open issues by label (raw)')
  .get('/issues-raw/badges/shields/service-badge.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'open service-badge issues',
      value: isMetric,
    })
  )

// See #1870
t.create('GitHub open issues by label including slash charactr (raw)')
  .get('/issues-raw/IgorNovozhilov/ndk/@ndk/cfg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'open @ndk/cfg issues',
      value: isMetric,
    })
  )

t.create('GitHub open issues (repo not found)')
  .get('/issues-raw/badges/helmets.json')
  .expectJSON({
    name: 'open issues',
    value: 'repo not found',
  })

t.create('GitHub open pull requests by label')
  .get('/issues-pr/badges/shields/service-badge.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'service-badge pull requests',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub open pull requests by label (raw)')
  .get('/issues-pr-raw/badges/shields/service-badge.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'open service-badge pull requests',
      value: isMetric,
    })
  )

t.create('Followers')
  .get('/followers/webcaetano.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'followers',
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Followers (user not found)')
  .get('/followers/PyvesB2.json')
  .expectJSON({
    name: 'followers',
    value: 'user not found',
  })

t.create('Watchers')
  .get('/watchers/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'watchers',
      value: Joi.number()
        .integer()
        .positive(),
    })
  )

t.create('Watchers (repo not found)')
  .get('/watchers/badges/helmets.json')
  .expectJSON({
    name: 'watchers',
    value: 'repo not found',
  })

t.create('Stars')
  .get('/stars/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Stars (repo not found)')
  .get('/stars/badges/helmets.json')
  .expectJSON({
    name: 'stars',
    value: 'repo not found',
  })

t.create('Forks')
  .get('/forks/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'forks',
      value: Joi.number()
        .integer()
        .positive(),
    })
  )

t.create('Forks (repo not found)')
  .get('/forks/badges/helmets.json')
  .expectJSON({
    name: 'forks',
    value: 'repo not found',
  })

t.create('Commits since')
  .get(
    '/commits-since/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7.json'
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Commits since by latest release')
  .get('/commits-since/microsoft/typescript/latest.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
      value: Joi.string().regex(/^\d+\w?$/),
    })
  )

t.create('Release')
  .get('/release/photonstorm/phaser.json')
  .expectJSONTypes(Joi.object().keys({ name: 'release', value: Joi.string() }))

t.create('Release (repo not found)')
  .get('/release/badges/helmets.json')
  .expectJSON({ name: 'release', value: 'repo not found' })

t.create('(pre-)Release')
  .get('/release/photonstorm/phaser/all.json')
  .expectJSONTypes(Joi.object().keys({ name: 'release', value: Joi.string() }))

t.create('Release Date. e.g release date|today')
  .get('/release-date/microsoft/vscode.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'release date',
      value: isFormattedDate,
    })
  )

t.create('Release Date - Custom Label. e.g myRelease|today')
  .get('/release-date/microsoft/vscode.json?label=myRelease')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'myRelease',
      value: isFormattedDate,
    })
  )

t.create(
  'Release Date - Should return `no releases or repo not found` for invalid repo'
)
  .get('/release-date/not-valid-name/not-valid-repo.json')
  .expectJSON({ name: 'release date', value: 'no releases or repo not found' })

t.create('(Pre-)Release Date. e.g release date|today')
  .get('/release-date-pre/microsoft/vscode.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'release date',
      value: isFormattedDate,
    })
  )

t.create('(Pre-)Release Date - Custom Label. e.g myRelease|today')
  .get('/release-date-pre/microsoft/vscode.json?label=myRelease')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'myRelease',
      value: isFormattedDate,
    })
  )

t.create(
  '(Pre-)Release Date - Should return `no releases or repo not found` for invalid repo'
)
  .get('/release-date-pre/not-valid-name/not-valid-repo.json')
  .expectJSON({ name: 'release date', value: 'no releases or repo not found' })

t.create('Tag')
  .get('/tag/photonstorm/phaser.json')
  .expectJSONTypes(Joi.object().keys({ name: 'tag', value: Joi.string() }))

t.create('Tag (repo not found)')
  .get('/tag/badges/helmets.json')
  .expectJSON({ name: 'tag', value: 'repo not found' })

t.create('Package version')
  .get('/package-json/v/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'package',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Package version (repo not found)')
  .get('/package-json/v/badges/helmets.json')
  .expectJSON({
    name: 'package',
    value: 'repo not found',
  })

t.create('Package name')
  .get('/package-json/n/badges/shields.json')
  .expectJSON({ name: 'package name', value: 'gh-badges' })

t.create('Package name - Custom label')
  .get('/package-json/name/badges/shields.json?label=Dev Name')
  .expectJSON({ name: 'Dev Name', value: 'gh-badges' })

t.create('Package array')
  .get('/package-json/keywords/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'package keywords',
      value: Joi.string().regex(/.*?,/),
    })
  )

t.create('Package object')
  .get('/package-json/dependencies/badges/shields.json')
  .expectJSON({ name: 'package dependencies', value: 'invalid data' })

t.create('Manifest version')
  .get('/manifest-json/v/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'manifest',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Manifest name')
  .get('/manifest-json/n/RedSparr0w/IndieGala-Helper.json')
  .expectJSON({ name: 'manifest name', value: 'IndieGala Helper' })

t.create('Manifest array')
  .get('/manifest-json/permissions/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'manifest permissions',
      value: Joi.string().regex(/.*?,/),
    })
  )

t.create('Manifest object')
  .get('/manifest-json/background/RedSparr0w/IndieGala-Helper.json')
  .expectJSON({ name: 'manifest background', value: 'invalid data' })

t.create('Manifest invalid json response')
  .get('/manifest-json/v/RedSparr0w/not-a-real-project.json')
  .expectJSON({ name: 'manifest', value: 'repo not found' })

t.create('Manifest no network connection')
  .get('/manifest-json/v/RedSparr0w/IndieGala-Helper.json')
  .networkOff()
  .expectJSON({ name: 'manifest', value: 'inaccessible' })

t.create('File size')
  .get('/size/webcaetano/craft/build/phaser-craft.min.js.json')
  .expectJSONTypes(Joi.object().keys({ name: 'size', value: isFileSize }))

t.create('File size 404')
  .get('/size/webcaetano/craft/build/does-not-exist.min.js.json')
  .expectJSON({ name: 'size', value: 'repo or file not found' })

t.create('File size for "not a regular file"')
  .get('/size/webcaetano/craft/build.json')
  .expectJSON({ name: 'size', value: 'not a regular file' })

t.create('Downloads all releases')
  .get('/downloads/photonstorm/phaser/total.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(/^\w+\s+total$/),
    })
  )

t.create('Downloads all releases (repo not found)')
  .get('/downloads/badges/helmets/total.json')
  .expectJSON({
    name: 'downloads',
    value: 'repo or release not found',
  })

t.create('downloads for latest release')
  .get('/downloads/photonstorm/phaser/latest/total.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('downloads-pre for latest release')
  .get('/downloads-pre/photonstorm/phaser/latest/total.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('downloads for release without slash')
  .get('/downloads/atom/atom/v0.190.0/total.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? v0\.190\.0$/),
    })
  )

t.create('downloads for specific asset without slash')
  .get('/downloads/atom/atom/v0.190.0/atom-amd64.deb.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(
        /^[0-9]+[kMGTPEZY]? v0\.190\.0 \[atom-amd64\.deb\]$/
      ),
    })
  )

t.create('downloads for specific asset from latest release')
  .get('/downloads/atom/atom/latest/atom-amd64.deb.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? \[atom-amd64\.deb\]$/),
    })
  )

t.create('downloads-pre for specific asset from latest release')
  .get('/downloads-pre/atom/atom/latest/atom-amd64.deb.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? \[atom-amd64\.deb\]$/),
    })
  )

t.create('downloads for release with slash')
  .get('/downloads/NHellFire/dban/stable/v2.2.8/total.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? stable\/v2\.2\.8$/),
    })
  )

t.create('downloads for specific asset with slash')
  .get('/downloads/NHellFire/dban/stable/v2.2.8/dban-2.2.8_i586.iso.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(
        /^[0-9]+[kMGTPEZY]? stable\/v2\.2\.8 \[dban-2\.2\.8_i586\.iso\]$/
      ),
    })
  )

t.create('downloads for unknown release')
  .get('/downloads/atom/atom/does-not-exist/total.json')
  .expectJSON({ name: 'downloads', value: 'repo or release not found' })

t.create('hit counter')
  .get('/search/torvalds/linux/goto.json')
  .timeout(8000)
  .expectJSONTypes(Joi.object().keys({ name: 'goto counter', value: isMetric }))

t.create('hit counter for nonexistent repo')
  .get('/search/torvalds/not-linux/goto.json')
  .timeout(8000)
  .expectJSON({ name: 'goto counter', value: 'repo not found' })

t.create('commit activity (1 year)')
  .get('/commit-activity/y/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'commit activity',
      value: isMetricOverTimePeriod,
    })
  )

t.create('commit activity (4 weeks)')
  .get('/commit-activity/4w/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'commit activity',
      value: isMetricOverTimePeriod,
    })
  )

t.create('commit activity (1 week)')
  .get('/commit-activity/w/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'commit activity',
      value: isMetricOverTimePeriod,
    })
  )

t.create('commit activity (repo not found)')
  .get('/commit-activity/w/badges/helmets.json')
  .expectJSON({
    name: 'commit activity',
    value: 'repo not found',
  })

t.create('last commit (recent)')
  .get('/last-commit/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'last commit', value: isFormattedDate })
  )

t.create('last commit (ancient)')
  .get('/last-commit/badges/badgr.co.json')
  .expectJSON({ name: 'last commit', value: 'january 2014' })

t.create('last commit (on branch)')
  .get('/last-commit/badges/badgr.co/shielded.json')
  .expectJSON({ name: 'last commit', value: 'july 2013' })

t.create('last commit (repo not found)')
  .get('/last-commit/badges/helmets.json')
  .expectJSON({ name: 'last commit', value: 'repo not found' })

t.create('github issue state')
  .get('/issues/detail/s/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'issue 979',
      value: Joi.equal('open', 'closed'),
    })
  )

t.create('github issue state (repo not found)')
  .get('/issues/detail/s/badges/helmets/979.json')
  .expectJSON({
    name: 'issue/pull request 979',
    value: 'issue, pull request or repo not found',
  })

t.create('github issue title')
  .get('/issues/detail/title/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'issue 979',
      value: 'Github rate limits cause transient service test failures in CI',
    })
  )

t.create('github issue author')
  .get('/issues/detail/u/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({ name: 'author', value: 'paulmelnikow' }))

t.create('github issue label')
  .get('/issues/detail/label/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'label',
      value: Joi.equal(
        'bug | developer-experience',
        'developer-experience | bug'
      ),
    })
  )

t.create('github issue comments')
  .get('/issues/detail/comments/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'comments',
      value: Joi.number().greater(15),
    })
  )

t.create('github issue age')
  .get('/issues/detail/age/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'created', value: isFormattedDate })
  )

t.create('github issue update')
  .get('/issues/detail/last-update/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'updated', value: isFormattedDate })
  )

t.create('github pull request check state')
  .get('/status/s/pulls/badges/shields/1110.json')
  .expectJSONTypes(Joi.object().keys({ name: 'checks', value: 'failure' }))

t.create('github pull request check state (pull request not found)')
  .get('/status/s/pulls/badges/shields/5110.json')
  .expectJSON({ name: 'checks', value: 'pull request or repo not found' })

t.create('github pull request check contexts')
  .get('/status/contexts/pulls/badges/shields/1110.json')
  .expectJSONTypes(Joi.object().keys({ name: 'checks', value: '1 failure' }))

t.create('top language')
  .get('/languages/top/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'JavaScript',
      value: Joi.string().regex(/^([1-9]?[0-9]\.[0-9]|100\.0)%$/),
    })
  )

t.create('top language with empty repository')
  .get('/languages/top/pyvesb/emptyrepo.json')
  .expectJSON({ name: 'language', value: 'none' })

t.create('language count')
  .get('/languages/count/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'languages',
      value: Joi.number()
        .integer()
        .positive(),
    })
  )

t.create('language count (repo not found)')
  .get('/languages/count/badges/helmets.json')
  .expectJSON({
    name: 'languages',
    value: 'repo not found',
  })

t.create('code size in bytes for all languages')
  .get('/languages/code-size/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code size',
      value: isFileSize,
    })
  )

t.create('repository size')
  .get('/repo-size/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'repo size',
      value: isFileSize,
    })
  )

t.create('repository size (repo not found)')
  .get('/repo-size/badges/helmets.json')
  .expectJSON({
    name: 'repo size',
    value: 'repo not found',
  })

// Commit status
t.create('commit status - commit in branch')
  .get(
    '/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'in master',
    colorB: colorsB.brightgreen,
  })

t.create(
  'commit status - checked commit is identical with the newest commit in branch'
)
  .get(
    '/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(200, { status: 'identical' })
  )
  .expectJSON({
    name: 'commit status',
    value: 'in master',
    colorB: colorsB.brightgreen,
  })

t.create('commit status - commit not in branch')
  .get(
    '/commit-status/badges/shields/master/960c5bf72d7d1539fcd453343eed3f8617427a41.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'commit or branch not found',
    colorB: colorsB.lightgrey,
  })

t.create('commit status - unknown commit id')
  .get(
    '/commit-status/atom/atom/v1.27.1/7dfb45eb61a48a4ce18a0dd2e31f944ed4467ae3.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'not in v1.27.1',
    colorB: colorsB.yellow,
  })

t.create('commit status - unknown branch')
  .get(
    '/commit-status/badges/shields/this-branch-does-not-exist/b551a3a8daf1c48dba32a3eab1edf99b10c28863.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'commit or branch not found',
    colorB: colorsB.lightgrey,
  })

t.create('commit status - no common ancestor between commit and branch')
  .get(
    '/commit-status/badges/shields/master/b551a3a8daf1c48dba32a3eab1edf99b10c28863.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'no common ancestor',
    colorB: colorsB.lightgrey,
  })

t.create('commit status - invalid JSON')
  .get(
    '/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(invalidJSON)
  )
  .expectJSON({
    name: 'commit status',
    value: 'invalid',
    colorB: colorsB.lightgrey,
  })

t.create('commit status - network error')
  .get(
    '/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .networkOff()
  .expectJSON({
    name: 'commit status',
    value: 'inaccessible',
    colorB: colorsB.red,
  })

t.create('commit status - github server error')
  .get(
    '/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(500)
  )
  .expectJSON({
    name: 'commit status',
    value: 'invalid',
    colorB: colorsB.lightgrey,
  })

t.create('commit status - 404 with empty JSON form github')
  .get(
    '/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(404, {})
  )
  .expectJSON({
    name: 'commit status',
    value: 'invalid',
    colorB: colorsB.lightgrey,
  })

t.create('commit status - 404 with invalid JSON form github')
  .get(
    '/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(404, invalidJSON)
  )
  .expectJSON({
    name: 'commit status',
    value: 'invalid',
    colorB: colorsB.lightgrey,
  })
