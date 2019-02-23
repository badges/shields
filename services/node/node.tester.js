'use strict'

const { expect } = require('chai')
const Joi = require('joi')
const { Range } = require('semver')
const t = (module.exports = require('../tester').createServiceTester())

function expectSemverRange(value) {
  expect(() => new Range(value)).not.to.throw()
}

t.create('gets the node version of passport')
  .get('/passport.json')
  .expectJSONTypes(Joi.object({ name: 'node' }).unknown())
  .afterJSON(json => {
    expectSemverRange(json.value)
  })

t.create('gets the node version of @stdlib/stdlib')
  .get('/@stdlib/stdlib.json')
  .expectJSONTypes(Joi.object({ name: 'node' }).unknown())
  .afterJSON(json => {
    expectSemverRange(json.value)
  })

t.create("gets the tagged release's node version version of ionic")
  .get('/ionic/next.json')
  .expectJSONTypes(Joi.object({ name: 'node@next' }).unknown())
  .afterJSON(json => {
    expectSemverRange(json.value)
  })

t.create('gets the node version of passport from a custom registry')
  .get('/passport.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object({ name: 'node' }).unknown())
  .afterJSON(json => {
    expectSemverRange(json.value)
  })

t.create("gets the tagged release's node version of @cycle/core")
  .get('/@cycle/core/canary.json')
  .expectJSONTypes(Joi.object({ name: 'node@canary' }).unknown())
  .afterJSON(json => {
    expectSemverRange(json.value)
  })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .expectJSON({ name: 'node', value: 'package not found' })
