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
  .get('/github/depfu/example-ruby.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyStatus,
  })

t.create('depfu dependencies (repo not found)')
  .get('/github/pyvesb/emptyrepo.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })

t.create('legacy route (assume "github" as a default VCS)')
  .get('/depfu/example-ruby.svg')
  .expectRedirect('/depfu/github/depfu/example-ruby.svg')
