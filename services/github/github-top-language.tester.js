import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('top language')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'javascript',
    message: Joi.string().regex(/^([1-9]?[0-9]\.[0-9]|100\.0)%$/),
  })

t.create('top language (empty repo)')
  .get('/pyvesb/emptyrepo.json')
  .expectBadge({ label: 'language', message: 'none' })

t.create('top language (repo not found)')
  .get('/not-a-real-user/not-a-real-repo.json')
  .expectBadge({ label: 'language', message: 'repo not found' })
