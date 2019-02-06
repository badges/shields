'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'bountysource',
  title: 'Bountysource',
}))

t.create('bounties (valid)')
  .get('/team/mozilla-core/activity.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'bounties',
      value: isMetric,
    })
  )

t.create('bounties (invalid team)')
  .get('/team/not-a-real-team/activity.json')
  .expectJSON({
    name: 'bounties',
    value: 'not found',
  })
