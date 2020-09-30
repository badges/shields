'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

const isDependencyStatus = Joi.string().valid(
  'insecure',
  'up to date',
  'out of date'
)

t.create('david dependencies (valid)')
  .get('/expressjs/express.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyStatus,
  })

t.create('david dev dependencies (valid)')
  .get('/dev/expressjs/express.json')
  .expectBadge({
    label: 'dev dependencies',
    message: isDependencyStatus,
  })

t.create('david optional dependencies (valid)')
  .get('/optional/elnounch/byebye.json')
  .expectBadge({
    label: 'optional dependencies',
    message: isDependencyStatus,
  })

t.create('david peer dependencies (valid)')
  .get('/peer/webcomponents/generator-element.json')
  .expectBadge({
    label: 'peer dependencies',
    message: isDependencyStatus,
  })

t.create('david dependencies with path (valid)')
  .get('/babel/babel.json?path=packages/babel-core')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyStatus,
  })

t.create('david dependencies (none)')
  .get('/peer/expressjs/express.json') // express does not specify peer dependencies
  .expectBadge({ label: 'peer dependencies', message: 'none' })

t.create('david dependencies (repo not found)')
  .get('/pyvesb/emptyrepo.json')
  .expectBadge({
    label: 'dependencies',
    message: 'repo or path not found or david internal error',
  })

t.create('david dependencies (path not found')
  .get('/babel/babel.json?path=invalid/path')
  .expectBadge({
    label: 'dependencies',
    message: 'repo or path not found or david internal error',
  })
