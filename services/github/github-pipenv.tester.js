import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import {
  isCommitHash,
  isVPlusDottedVersionAtLeastOne,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} from '../test-validators.js'

// e.g. v19.3b0
const isBlackVersion = Joi.string().regex(/^v\d+(\.\d+)*(.*)?$/)

export const t = new ServiceTester({
  id: 'GithubPipenv',
  title: 'GithubPipenv',
  pathPrefix: '/github/pipenv',
})

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
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/rq-dashboard.json',
  )
  .expectBadge({
    label: 'rq-dashboard',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('Locked version of default dependency (branch)')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/rq-dashboard/main.json',
  )
  .expectBadge({
    label: 'rq-dashboard',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('Locked version of dev dependency')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/dev/black.json',
  )
  .expectBadge({
    label: 'black',
    message: isBlackVersion,
  })

t.create('Locked version of dev dependency (branch)')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/dev/black/main.json',
  )
  .expectBadge({
    label: 'black',
    message: isBlackVersion,
  })

t.create('Locked version of unknown dependency')
  .get(
    '/locked/dependency-version/metabolize/rq-dashboard-on-heroku/dev/i-made-this-up.json',
  )
  .expectBadge({
    label: 'dependency',
    message: 'dev dependency not found',
  })

t.create('Locked version of VCS dependency')
  .get('/locked/dependency-version/pypa/pipenv/dev/pypiserver.json')
  .expectBadge({
    label: 'pypiserver',
    message: isCommitHash,
  })
