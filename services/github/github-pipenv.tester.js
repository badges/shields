'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const {
  isVPlusDottedVersionAtLeastOne,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')

// e.g. v19.3b0
const isBlackVersion = Joi.string().regex(/^v\d+(\.\d+)*(.*)?$/)
const isShortSha = Joi.string().regex(/[0-9a-f]{7}/)

const t = (module.exports = new ServiceTester({
  id: 'GithubPipenv',
  title: 'GithubPipenv',
  pathPrefix: '/github/pipenv',
}))

t.create('Locked Python version')
  .get('/locked/python-version/metabolize/rq-dashboard-on-heroku.json')
  .expectBadge({
    label: 'python',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Locked Python version (no pipfile.lock)')
  .get('/locked/python-version/metabolize/react-flexbox-svg.json')
  .expectBadge({
    label: 'python',
    message: 'repo not found, branch not found, or Pipfile.lock missing',
  })

t.create('Locked Python version (pipfile.lock has no python version)')
  .get('/locked/python-version/fikovnik/ShiftIt.json')
  .expectBadge({
    label: 'python',
    message: 'version not specified',
  })

t.create('Locked version of default dependency')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/rq-dashboard.json'
  )
  .expectBadge({
    label: 'rq-dashboard',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('Locked version of default dependency (branch)')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/rq-dashboard/master.json'
  )
  .expectBadge({
    label: 'rq-dashboard',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('Locked version of dev dependency')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/dev/black.json'
  )
  .expectBadge({
    label: 'black',
    message: isBlackVersion,
  })

t.create('Locked version of dev dependency (branch)')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/dev/black/master.json'
  )
  .expectBadge({
    label: 'black',
    message: isBlackVersion,
  })

t.create('Locked version of unknown dependency')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/dev/i-made-this-up.json'
  )
  .expectBadge({
    label: 'dependency',
    message: 'dev dependency not found',
  })

t.create('Locked version of VCS dependency')
  .get(
    '/locked/dependency-version/DemocracyClub/aggregator-api/dc-base-theme.json'
  )
  .expectBadge({
    label: 'dc-base-theme',
    message: isShortSha,
  })
