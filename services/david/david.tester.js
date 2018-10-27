'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { invalidJSON } = require('../response-fixtures')
const isDependencyStatus = Joi.string().valid(
  'insecure',
  'up to date',
  'out of date'
)

const t = new ServiceTester({ id: 'david', title: 'David' })
module.exports = t

t.create('david dependencies (valid)')
  .get('/expressjs/express.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dependencies',
      value: isDependencyStatus,
    })
  )

t.create('david dev dependencies (valid)')
  .get('/dev/expressjs/express.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dev dependencies',
      value: isDependencyStatus,
    })
  )

t.create('david optional dependencies (valid)')
  .get('/optional/elnounch/byebye.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'optional dependencies',
      value: isDependencyStatus,
    })
  )

t.create('david peer dependencies (valid)')
  .get('/peer/webcomponents/generator-element.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'peer dependencies',
      value: isDependencyStatus,
    })
  )

t.create('david dependencies with path (valid)')
  .get('/babel/babel.json?path=packages/babel-core')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dependencies',
      value: isDependencyStatus,
    })
  )

t.create('david dependencies (none)')
  .get('/peer/expressjs/express.json') // express does not specify peer dependencies
  .expectJSON({ name: 'peer dependencies', value: 'none' })

t.create('david dependencies (repo not found)')
  .get('/pyvesb/emptyrepo.json')
  .expectJSON({ name: 'dependencies', value: 'invalid' })

t.create('david dependencies (path not found')
  .get('/babel/babel.json?path=invalid/path')
  .expectJSON({ name: 'dependencies', value: 'invalid' })

t.create('david dependencies (connection error)')
  .get('/expressjs/express.json')
  .networkOff()
  .expectJSON({ name: 'dependencies', value: 'inaccessible' })

t.create('david dependencies (unexpected response)')
  .get('/expressjs/express.json')
  .intercept(nock =>
    nock('https://david-dm.org')
      .get('/expressjs/express/info.json')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'dependencies', value: 'invalid' })
