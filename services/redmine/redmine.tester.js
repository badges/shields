'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isStarRating } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'redmine',
  title: 'Redmine',
}))

t.create('plugin rating')
  .get('/plugin/rating/redmine_xlsx_format_issue_exporter.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: Joi.string().regex(/^[0-9]+\.[0-9]+\/5\.0$/),
    })
  )

t.create('plugin stars')
  .get('/plugin/stars/redmine_xlsx_format_issue_exporter.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: isStarRating,
    })
  )

t.create('plugin not found')
  .get('/plugin/rating/plugin_not_found.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'redmine',
      value: 'not found',
    })
  )
