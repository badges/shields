'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isHacktoberfestNoIssuesStatus = Joi.string().regex(
  /^[0-9]+ PRs?(, [0-9]+ days? left)?$/
)
const isHacktoberfestNoPRsStatus = Joi.string().regex(
  /^([0-9]+ open issues?)?[0-9]+ days? left$/
)
const isHacktoberfestCombinedStatus = Joi.string().regex(
  /^[0-9]+ open issues?(, [0-9]+ PRs?)?(, [0-9]+ days? left)?$/
)
const isHacktoberfestStatus = Joi.alternatives().try(
  isHacktoberfestNoIssuesStatus,
  isHacktoberfestNoPRsStatus,
  isHacktoberfestCombinedStatus,
  /^is over! \([0-9]+ PRs? opened\)$/
)

t.create('GitHub Hacktoberfest combined status')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'hacktoberfest',
    message: isHacktoberfestStatus,
  })

t.create('GitHub Hacktoberfest combined status (suggestion label override)')
  .get(
    `/badges/shields.json?suggestion_label=${encodeURIComponent(
      'good first issue'
    )}`
  )
  .expectBadge({
    label: 'hacktoberfest',
    message: isHacktoberfestStatus,
  })
