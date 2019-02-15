'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { invalidJSON } = require('../response-fixtures')
const { isMetric, isVPlusTripleDottedVersion } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'apm',
  title: 'Atom Package Manager',
}))

t.create('Downloads')
  .get('/dm/vim-mode.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('Version')
  .get('/v/vim-mode.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'apm', value: isVPlusTripleDottedVersion })
  )

t.create('License')
  .get('/l/vim-mode.json')
  .expectJSON({ name: 'license', value: 'MIT' })

t.create('Downloads | Package not found')
  .get('/dm/notapackage.json')
  .expectJSON({ name: 'downloads', value: 'package not found' })

t.create('Version | Package not found')
  .get('/v/notapackage.json')
  .expectJSON({ name: 'apm', value: 'package not found' })

t.create('License | Package not found')
  .get('/l/notapackage.json')
  .expectJSON({ name: 'license', value: 'package not found' })

t.create('Invalid version')
  .get('/dm/vim-mode.json')
  .intercept(nock =>
    nock('https://atom.io')
      .get('/api/packages/vim-mode')
      .reply([200, '{"releases":{}}'])
  )
  .expectJSON({ name: 'downloads', value: 'unparseable json response' })

t.create('Invalid License')
  .get('/l/vim-mode.json')
  .intercept(nock =>
    nock('https://atom.io')
      .get('/api/packages/vim-mode')
      .reply([200, '{"metadata":{}}'])
  )
  .expectJSON({ name: 'license', value: 'unparseable json response' })

t.create('Unexpected response')
  .get('/dm/vim-mode.json')
  .intercept(nock =>
    nock('https://atom.io')
      .get('/api/packages/vim-mode')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'downloads', value: 'unparseable json response' })
