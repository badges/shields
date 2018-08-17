'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const {
  isVPlusDottedVersionAtLeastOne,
  isMetric,
} = require('../test-validators')
const isOrdinalNumber = Joi.string().regex(/^[1-9][0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ)$/)
const isOrdinalNumberDaily = Joi.string().regex(
  /^[1-9][0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ) daily$/
)

const t = new ServiceTester({ id: 'gem', title: 'Ruby Gems' })
module.exports = t

// version endpoint

t.create('version (valid)')
  .get('/v/formatador.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'gem',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('version (not found)')
  .get('/v/not-a-package.json')
  .expectJSON({ name: 'gem', value: 'not found' })

// downloads endpoints

// total downloads
t.create('total downloads (valid)')
  .get('/dt/rails.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('total downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'not found' })

// version downloads
t.create('version downloads (valid, stable version)')
  .get('/dv/rails/stable.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads@stable',
      value: isMetric,
    })
  )

t.create('version downloads (valid, specific version)')
  .get('/dv/rails/4.1.0.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads@4.1.0',
      value: isMetric,
    })
  )

t.create('version downloads (package not found)')
  .get('/dv/not-a-package/4.1.0.json')
  .expectJSON({ name: 'downloads', value: 'not found' })

t.create('version downloads (valid package, invalid version)')
  .get('/dv/rails/not-a-version.json')
  .expectJSON({ name: 'downloads', value: 'invalid' })

t.create('version downloads (valid package, version not specified)')
  .get('/dv/rails.json')
  .expectJSON({ name: 'downloads', value: 'invalid' })

// latest version downloads
t.create('latest version downloads (valid)')
  .get('/dtv/rails.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads@latest',
      value: isMetric,
    })
  )

t.create('latest version downloads (not found)')
  .get('/dtv/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'not found' })

// users endpoint

t.create('users (valid)')
  .get('/u/raphink.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'gems',
      value: Joi.string().regex(/^[0-9]+$/),
    })
  )

t.create('users (not found)')
  .get('/u/not-a-package.json')
  .expectJSON({ name: 'gems', value: 'not found' })

// rank endpoint

t.create('total rank (valid)')
  .get('/rt/rspec-puppet-facts.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rank',
      value: isOrdinalNumber,
    })
  )

t.create('daily rank (valid)')
  .get('/rd/rspec-puppet-facts.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rank',
      value: isOrdinalNumberDaily,
    })
  )

t.create('rank (not found)')
  .get('/rt/not-a-package.json')
  .expectJSON({ name: 'rank', value: 'not found' })
