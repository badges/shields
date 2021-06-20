import Joi from 'joi'
import { ServiceTester } from '../tester.js'

const isDependencyStatus = Joi.string().valid(
  'insecure',
  'latest',
  'recent',
  'stale'
)

export const t = new ServiceTester({ id: 'depfu', title: 'Depfu' })

t.create('depfu dependencies (valid)')
  .get('/depfu/example-ruby.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyStatus,
  })

t.create('depfu dependencies (repo not found)')
  .get('/pyvesb/emptyrepo.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
