'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const {
  isVPlusTripleDottedVersion,
  isMetric,
  isStarRating,
} = require('../test-validators')

const isVscodeRating = Joi.string().regex(/[0-5].[0-9]{2}\/5?\s*\([0-9]*\)$/)

const t = new ServiceTester({
  id: 'vscode-marketplace',
  title: 'VS Code Marketplace',
})
module.exports = t

t.create('Downloads')
  .get('/d/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('Downloads | User specified label')
  .get('/d/ritwickdey.LiveServer.json?label=Total Installs')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'Total Installs',
      value: isMetric,
    })
  )

t.create('Rating')
  .get('/r/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isVscodeRating,
    })
  )

t.create('Rating | User specified label')
  .get('/r/ritwickdey.LiveServer.json?label=My custom rating label')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'My custom rating label',
      value: isVscodeRating,
    })
  )

t.create('Star Rating')
  .get('/stars/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )

t.create('Star Rating | User specified label')
  .get('/stars/ritwickdey.LiveServer.json?label=My custom rating label')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'My custom rating label',
      value: isStarRating,
    })
  )

t.create('Version')
  .get('/v/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'visual studio marketplace',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('Version | User specified label')
  .get('/v/ritwickdey.LiveServer.json?label=VSM')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'VSM',
      value: isVPlusTripleDottedVersion,
    })
  )
