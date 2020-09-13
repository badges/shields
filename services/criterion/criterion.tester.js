'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())
const {
  IMPROVED_STATUS,
  REGRESSED_STATUS,
  NOT_FOUND_STATUS,
} = require('./constants')

const isStatus = Joi.string()
  .allow(IMPROVED_STATUS, NOT_FOUND_STATUS, REGRESSED_STATUS)
  .required()

t.create('Criterion (valid repo)')
  .get('/chmoder/credit_card.json')
  .expectBadge({ label: 'criterion', message: isStatus })

t.create('Criterion (not found)')
  .get('/chmoder/not-a-repo.json')
  .expectBadge({ label: 'criterion', message: NOT_FOUND_STATUS })
