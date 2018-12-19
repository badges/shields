'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

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
