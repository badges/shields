'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')

const multipleVersions = withRegex(/^([+]?\d*\.\d+)(-)([+]?\d*\.\d+)$/)

const t = (module.exports = require('../tester').createServiceTester())

t.create('EssentialsX - multiple versions supported - (id 9089)')
  .get('/9089.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tested versions',
      value: multipleVersions,
    })
  )

t.create('Invalid Resource (id 1)')
  .get('/1.json')
  .expectJSON({
    name: 'tested versions',
    value: 'not found',
  })

t.create('Nock - single version supported')
  .get('/1.json')
  .intercept(nock =>
    nock('https://api.spiget.org/v2/resources/')
      .get('/1')
      .reply(200, {
        downloads: 1,
        file: {
          size: 1,
          sizeUnit: '1',
        },
        testedVersions: ['1.13'],
        rating: {
          count: 1,
          average: 1,
        },
      })
  )
  .expectJSON({
    name: 'tested versions',
    value: '1.13',
  })

t.create('Nock - multiple versions supported')
  .get('/1.json')
  .intercept(nock =>
    nock('https://api.spiget.org/v2/resources/')
      .get('/1')
      .reply(200, {
        downloads: 1,
        file: {
          size: 1,
          sizeUnit: '1',
        },
        testedVersions: ['1.10', '1.11', '1.12', '1.13'],
        rating: {
          count: 1,
          average: 1,
        },
      })
  )
  .expectJSON({
    name: 'tested versions',
    value: '1.10-1.13',
  })
