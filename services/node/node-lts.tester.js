'use strict'

const { expect } = require('chai')
const { Range } = require('semver')
const t = (module.exports = require('../tester').createServiceTester())

function expectSemverRange(message) {
  expect(() => new Range(message)).not.to.throw()
}

t.create('gets the node version of passport')
  .get('/passport.json')
  .expectBadge({ label: 'node' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('gets the node version of @stdlib/stdlib')
  .get('/@stdlib/stdlib.json')
  .expectBadge({ label: 'node' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create("gets the tagged release's node version version of ionic")
  .get('/ionic/next.json')
  .expectBadge({ label: 'node@next' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('gets the node version of passport from a custom registry')
  .get('/passport.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({ label: 'node' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create("gets the tagged release's node version of @cycle/core")
  .get('/@cycle/core/canary.json')
  .expectBadge({ label: 'node@canary' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .expectBadge({ label: 'node', message: 'package not found' })
