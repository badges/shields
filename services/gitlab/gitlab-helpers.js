'use strict'

const Joi = require('joi')

const isPipelineStatus = Joi.equal(
  'pending',
  'running',
  'passed',
  'failed',
  'skipped',
  'canceled'
).required()

module.exports = {
  isPipelineStatus,
}
