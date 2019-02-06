'use strict'

const Joi = require('joi')
const { isMetric, isMetricOpenIssues } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('GitHub closed pull requests')
  .get('/issues-pr-closed/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pull requests',
      value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? closed$/),
    })
  )

t.create('GitHub closed pull requests raw')
  .get('/issues-pr-closed-raw/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'closed pull requests',
      value: Joi.string().regex(/^\w+?$/),
    })
  )

t.create('GitHub pull requests')
  .get('/issues-pr/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pull requests',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub pull requests raw')
  .get('/issues-pr-raw/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'open pull requests',
      value: isMetric,
    })
  )

t.create('GitHub closed issues')
  .get('/issues-closed/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'issues',
      value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? closed$/),
    })
  )

t.create('GitHub closed issues raw')
  .get('/issues-closed-raw/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'closed issues',
      value: Joi.string().regex(/^\w+\+?$/),
    })
  )

t.create('GitHub open issues')
  .get('/issues/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'issues',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub open issues raw')
  .get('/issues-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({ name: 'open issues', value: isMetric }))

t.create('GitHub open issues by label is > zero')
  .get('/issues/badges/shields/service-badge.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'service-badge issues',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub open issues by multi-word label is > zero')
  .get('/issues/Cockatrice/Cockatrice/App%20-%20Cockatrice.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: '"app - cockatrice" issues',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub open issues by label (raw)')
  .get('/issues-raw/badges/shields/service-badge.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'open service-badge issues',
      value: isMetric,
    })
  )

// https://github.com/badges/shields/issues/1870
t.create('GitHub open issues by label including slash character (raw)')
  .get('/issues-raw/IgorNovozhilov/ndk/@ndk/cfg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'open @ndk/cfg issues',
      // Not always > 0.
      value: Joi.alternatives(isMetric, Joi.equal('0')),
    })
  )

t.create('GitHub open issues (repo not found)')
  .get('/issues-raw/badges/helmets.json')
  .expectJSON({
    name: 'open issues',
    value: 'repo not found',
  })

t.create('GitHub open pull requests by label')
  .get('/issues-pr/badges/shields/service-badge.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'service-badge pull requests',
      value: isMetricOpenIssues,
    })
  )

t.create('GitHub open pull requests by label (raw)')
  .get('/issues-pr-raw/badges/shields/service-badge.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'open service-badge pull requests',
      value: isMetric,
    })
  )
