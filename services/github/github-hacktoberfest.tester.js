'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isHactoberfestCombinedStatus = Joi.string().regex(
  /^[0-9]+ suggestions(, [0-9]+ merged)?(, [0-9]+ days left)?$/
)

t.create('GitHub Hacktoberfest combined status')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'hacktoberfest',
    message: isHactoberfestCombinedStatus,
  })

t.create('GitHub Hacktoberfest combined status (suggestion label override')
  .get(
    `/badges/shields.json?suggestion_label=${encodeURIComponent(
      'good first issue'
    )}`
  )
  .expectBadge({
    label: 'hacktoberfest',
    message: isHactoberfestCombinedStatus,
  })
