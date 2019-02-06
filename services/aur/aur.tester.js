'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
  isMetric,
} = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'aur',
  title: 'Arch Linux AUR',
}))

// version tests

t.create('version (valid)')
  .get('/version/yaourt.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'aur',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
      color: 'blue',
    })
  )

t.create('version (valid, out of date)')
  .get('/version/gog-gemini-rue.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'aur',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
      color: 'orange',
    })
  )

t.create('version (not found)')
  .get('/version/not-a-package.json')
  .expectJSON({ name: 'aur', value: 'package not found' })

// votes tests

t.create('votes (valid)')
  .get('/votes/yaourt.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'votes',
      value: isMetric,
    })
  )

t.create('votes (not found)')
  .get('/votes/not-a-package.json')
  .expectJSON({ name: 'votes', value: 'package not found' })

// license tests

t.create('license (valid)')
  .get('/license/yaourt.json')
  .expectJSON({ name: 'license', value: 'GPL' })

t.create('license (not found)')
  .get('/license/not-a-package.json')
  .expectJSON({ name: 'license', value: 'package not found' })
