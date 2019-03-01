'use strict'

const { isIntegerPercentage } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'coveralls',
  title: 'Coveralls.io',
}))

t.create('error status code - location header is missing')
  .get('/github/not/existed.json')
  .intercept(nock =>
    nock('https://coveralls.io')
      .head('/repos/github/not/existed/badge.svg')
      .reply(404)
  )
  .expectBadge({ label: 'coverage', message: 'invalid' })

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
  .expectBadge({ label: 'coverage', message: 'malformed' })

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
  .expectBadge({ label: 'coverage', message: 'unknown' })

t.create('connection error')
  .get('/github/user/repository.json')
  .networkOff()
  .expectBadge({ label: 'coverage', message: 'invalid' })

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
  .expectBadge({ label: 'coverage', message: '50%' })

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
  .expectBadge({ label: 'coverage', message: '50%' })

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
  .expectBadge({ label: 'coverage', message: '50%' })

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
  .expectBadge({ label: 'coverage', message: '50%' })

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
  .expectBadge({ label: 'coverage', message: '50%' })

t.create('github coverage')
  .get('/github/jekyll/jekyll.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('github coverage for legacy link')
  .get('/jekyll/jekyll.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('bitbucket coverage')
  .get('/bitbucket/pyKLIP/pyklip.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })
