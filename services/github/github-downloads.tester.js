'use strict'

const Joi = require('@hapi/joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

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

t.create('downloads-pre for latest release')
  .get('/downloads-pre/photonstorm/phaser/latest/total.json')
  .expectBadge({ label: 'downloads@latest', message: isMetric })

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
