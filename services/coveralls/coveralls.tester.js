'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isIntegerPercentage } = require('../test-validators')

const t = new ServiceTester({ id: 'coveralls', title: 'Coveralls.io' })
module.exports = t

t.create('error status code - location header is missing')
  .get('/github/not/existed.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/github/not/existed/badge.svg')
      .reply(404)
  )
  .expectJSON({ name: 'coverage', value: 'invalid' })

t.create('malformed location')
  .get('/github/user/repository.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/github/user/repository/badge.svg')
      .reply(
        302,
        {},
        {
          Location:
            'https://s3.amazonaws.com/assets.coveralls.io/badges/malformedlocation.svg',
        }
      )
  )
  .expectJSON({ name: 'coverage', value: 'malformed' })

t.create('NaN percentage in location')
  .get('/github/user/repository.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/github/user/repository/badge.svg')
      .reply(
        302,
        {},
        {
          Location:
            'https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_notanumber.svg',
        }
      )
  )
  .expectJSON({ name: 'coverage', value: 'unknown' })

t.create('connection error')
  .get('/github/user/repository.json')
  .networkOff()
  .expectJSON({ name: 'coverage', value: 'invalid' })

t.create('show coverage')
  .get('/github/user/repository.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/github/user/repository/badge.svg')
      .reply(
        302,
        {},
        {
          Location:
            'https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_50.svg',
        }
      )
  )
  .expectJSON({ name: 'coverage', value: '50%' })

t.create('show coverage for legacy github link')
  .get('/user/repository.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/github/user/repository/badge.svg')
      .reply(
        302,
        {},
        {
          Location:
            'https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_50.svg',
        }
      )
  )
  .expectJSON({ name: 'coverage', value: '50%' })

t.create('show coverage for branch')
  .get('/github/user/repository/branch.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/github/user/repository/badge.svg?branch=branch')
      .reply(
        302,
        {},
        {
          Location:
            'https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_50.svg',
        }
      )
  )
  .expectJSON({ name: 'coverage', value: '50%' })

t.create('show coverage for bitbucket')
  .get('/bitbucket/user/repository.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/bitbucket/user/repository/badge.svg')
      .reply(
        302,
        {},
        {
          Location:
            'https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_50.svg',
        }
      )
  )
  .expectJSON({ name: 'coverage', value: '50%' })

t.create('show coverage for bitbucket with branch')
  .get('/bitbucket/user/repository/branch.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/bitbucket/user/repository/badge.svg?branch=branch')
      .reply(
        302,
        {},
        {
          Location:
            'https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_50.svg',
        }
      )
  )
  .expectJSON({ name: 'coverage', value: '50%' })

t.create('github coverage')
  .get('/github/jekyll/jekyll.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'coverage', value: isIntegerPercentage })
  )

t.create('github coverage for legacy link')
  .get('/jekyll/jekyll.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'coverage', value: isIntegerPercentage })
  )

t.create('bitbucket coverage')
  .get('/bitbucket/pyKLIP/pyklip.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'coverage', value: isIntegerPercentage })
  )
