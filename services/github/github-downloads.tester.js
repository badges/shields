import Joi from 'joi'
import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const mockLatestRelease = release => nock =>
  nock('https://api.github.com')
    .get('/repos/photonstorm/phaser/releases/latest')
    .reply(200, release)

const mockReleases = releases => nock =>
  nock('https://api.github.com')
    .get('/repos/photonstorm/phaser/releases')
    .reply(200, releases)

t.create('Downloads all releases')
  .get('/downloads/photonstorm/phaser/total.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads all releases (no releases)')
  .get('/downloads/badges/shields/total.json')
  .expectBadge({ label: 'downloads', message: 'no releases' })

t.create('Downloads-pre all releases (no releases)')
  .get('/downloads-pre/badges/shields/total.json')
  .expectBadge({ label: 'downloads', message: 'no releases' })

t.create('Downloads all releases (repo not found)')
  .get('/downloads/badges/helmets/total.json')
  .expectBadge({ label: 'downloads', message: 'repo not found' })

t.create('Downloads-pre all releases (repo not found)')
  .get('/downloads-pre/badges/helmets/total.json')
  .expectBadge({ label: 'downloads', message: 'repo not found' })

t.create('downloads for latest release')
  .get('/downloads/photonstorm/phaser/latest/total.json')
  .expectBadge({ label: 'downloads@latest', message: isMetric })

t.create('downloads for latest release (sort by date)')
  .get('/downloads/photonstorm/phaser/latest/total.json')
  .intercept(
    mockLatestRelease({
      assets: [
        { name: 'phaser.js', download_count: 5 },
        { name: 'phaser.min.js', download_count: 7 },
      ],
      tag_name: 'v3.15.1',
      prerelease: false,
    })
  )
  .expectBadge({ label: 'downloads@latest', message: '12' })

t.create('downloads for latest release (sort by SemVer)')
  .get('/downloads/photonstorm/phaser/latest/total.json?sort=semver')
  .intercept(
    mockReleases([
      {
        assets: [
          { name: 'phaser.js', download_count: 1 },
          { name: 'phaser.min.js', download_count: 3 },
        ],
        tag_name: 'v3.16.0-rc1',
        prerelease: true,
      },
      {
        assets: [
          { name: 'phaser.js', download_count: 5 },
          { name: 'phaser.min.js', download_count: 7 },
        ],
        tag_name: 'v3.15.0',
        prerelease: false,
      },
      {
        assets: [
          { name: 'phaser.js', download_count: 9 },
          { name: 'phaser.min.js', download_count: 11 },
        ],
        tag_name: 'v3.15.1',
        prerelease: false,
      },
    ])
  )
  .expectBadge({ label: 'downloads@latest', message: '20' })

t.create('downloads for latest release (sort by date including pre-releases)')
  .get('/downloads-pre/photonstorm/phaser/latest/total.json')
  .intercept(
    mockReleases([
      {
        assets: [
          { name: 'phaser.js', download_count: 1 },
          { name: 'phaser.min.js', download_count: 3 },
        ],
        tag_name: 'v3.16.0-rc1',
        prerelease: true,
      },
      {
        assets: [
          { name: 'phaser.js', download_count: 5 },
          { name: 'phaser.min.js', download_count: 7 },
        ],
        tag_name: 'v3.15.0',
        prerelease: false,
      },
      {
        assets: [
          { name: 'phaser.js', download_count: 9 },
          { name: 'phaser.min.js', download_count: 11 },
        ],
        tag_name: 'v3.15.1',
        prerelease: false,
      },
    ])
  )
  .expectBadge({ label: 'downloads@latest', message: '4' })

t.create('downloads for latest release (sort by SemVer including pre-releases)')
  .get('/downloads-pre/photonstorm/phaser/latest/total.json?sort=semver')
  .intercept(
    mockReleases([
      {
        assets: [
          { name: 'phaser.js', download_count: 9 },
          { name: 'phaser.min.js', download_count: 11 },
        ],
        tag_name: 'v3.15.1',
        prerelease: false,
      },
      {
        assets: [
          { name: 'phaser.js', download_count: 1 },
          { name: 'phaser.min.js', download_count: 3 },
        ],
        tag_name: 'v3.16.0-rc1',
        prerelease: true,
      },
      {
        assets: [
          { name: 'phaser.js', download_count: 5 },
          { name: 'phaser.min.js', download_count: 7 },
        ],
        tag_name: 'v3.15.0',
        prerelease: false,
      },
    ])
  )
  .expectBadge({ label: 'downloads@latest', message: '4' })

t.create('downloads-pre for latest release')
  .get('/downloads-pre/photonstorm/phaser/latest/total.json')
  .expectBadge({ label: 'downloads@latest', message: isMetric })

// https://github.com/badges/shields/issues/3786
t.create('downloads-pre for latest release (no-releases)')
  .get('/downloads-pre/badges/shields/latest/total.json')
  .expectBadge({ label: 'downloads', message: 'no releases' })

t.create('downloads for release without slash')
  .get('/downloads/atom/atom/v0.190.0/total.json')
  .expectBadge({ label: 'downloads@v0.190.0', message: isMetric })

t.create('downloads for specific asset without slash')
  .get('/downloads/atom/atom/v0.190.0/atom-amd64.deb.json')
  .expectBadge({
    label: 'downloads@v0.190.0',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) \[atom-amd64\.deb\]$/
    ),
  })

t.create('downloads for specific asset from latest release')
  .get('/downloads/atom/atom/latest/atom-amd64.deb.json')
  .expectBadge({
    label: 'downloads@latest',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) \[atom-amd64\.deb\]$/
    ),
  })

t.create('downloads-pre for specific asset from latest release')
  .get('/downloads-pre/atom/atom/latest/atom-amd64.deb.json')
  .expectBadge({
    label: 'downloads@latest',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) \[atom-amd64\.deb\]$/
    ),
  })

t.create('downloads for release with slash')
  .get('/downloads/NHellFire/dban/stable/v2.2.8/total.json')
  .expectBadge({ label: 'downloads@stable/v2.2.8', message: isMetric })

t.create('downloads for specific asset with slash')
  .get('/downloads/NHellFire/dban/stable/v2.2.8/dban-2.2.8_i586.iso.json')
  .expectBadge({
    label: 'downloads@stable/v2.2.8',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) \[dban-2\.2\.8_i586\.iso\]$/
    ),
  })

t.create('downloads for unknown release')
  .get('/downloads/atom/atom/does-not-exist/total.json')
  .expectBadge({ label: 'downloads', message: 'repo or release not found' })
