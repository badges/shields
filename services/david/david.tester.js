import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isDependencyStatus = Joi.string().valid(
  'insecure',
  'up to date',
  'out of date'
)

t.create('david dependencies (valid)')
  .get('/expressjs/express.json')
  .timeout(15000)
  .expectBadge({
    label: 'dependencies',
    message: isDependencyStatus,
  })

t.create('david dev dependencies (valid)')
  .get('/dev/expressjs/express.json')
  .timeout(15000)
  .expectBadge({
    label: 'dev dependencies',
    message: isDependencyStatus,
  })

t.create('david optional dependencies (valid)')
  .get('/optional/elnounch/byebye.json')
  .timeout(15000)
  .expectBadge({
    label: 'optional dependencies',
    message: isDependencyStatus,
  })

t.create('david peer dependencies (valid)')
  .get('/peer/webcomponents/generator-element.json')
  .timeout(15000)
  .expectBadge({
    label: 'peer dependencies',
    message: isDependencyStatus,
  })

t.create('david dependencies with path (valid)')
  .get('/babel/babel.json?path=packages/babel-core')
  .timeout(15000)
  .expectBadge({
    label: 'dependencies',
    message: isDependencyStatus,
  })

t.create('david dependencies (none)')
  .get('/peer/expressjs/express.json') // express does not specify peer dependencies
  .timeout(15000)
  .expectBadge({ label: 'peer dependencies', message: 'none' })

t.create('david dependencies (repo not found)')
  .get('/pyvesb/emptyrepo.json')
  .timeout(15000)
  .expectBadge({
    label: 'dependencies',
    message: 'repo or path not found or david internal error',
  })

t.create('david dependencies (path not found')
  .get('/babel/babel.json?path=invalid/path')
  .timeout(15000)
  .expectBadge({
    label: 'dependencies',
    message: 'repo or path not found or david internal error',
  })
