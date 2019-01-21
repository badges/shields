'use strict'

const Joi = require('joi')
const { semverRange } = require('../validators')
const t = (module.exports = require('../create-service-tester')())

t.create('gets the peer dependency version')
  .get('/react-boxplot/peer/react.json')
  .expectJSONTypes(
    Joi.object({
      name: 'react',
      value: semverRange,
    })
  )

t.create('gets the dev dependency version')
  .get('/react-boxplot/dev/react.json?label=react%20tested')
  .expectJSONTypes(
    Joi.object({
      name: 'react tested',
      value: semverRange,
    })
  )

t.create('gets the dev dependency version (scoped)')
  .get('/@metabolize/react-flexbox-svg/dev/eslint.json?')
  .expectJSONTypes(
    Joi.object({
      name: 'eslint',
      value: semverRange,
    })
  )

t.create('gets the prod dependency version')
  .get('/react-boxplot/simple-statistics.json')
  .expectJSONTypes(
    Joi.object({
      name: 'simple-statistics',
      value: semverRange,
    })
  )

t.create('unknown dependency')
  .get('/react-boxplot/dev/i-made-this-up.json')
  .expectJSON({
    name: 'dependency',
    value: 'dev dependency not found',
  })
