import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('language count (self-managed)')
  .get('/hansen6878/test.json?gitea_url=https://try.gitea.io')
  .expectBadge({
    label: 'languages',
    message: '0',
  })

t.create('language count (empty repo)')
  .get('/hansen6878/test.json')
  .expectBadge({
    label: 'languages',
    message: '0',
  })

t.create('language count (repo not found)')
  .get('/open/do-not-exist.json')
  .expectBadge({
    label: 'languages',
    message: 'repo not found',
  })

t.create('language count').get('/Bastrabun/bogus-mirror.json').expectBadge({
  label: 'languages',
  message: Joi.number().integer().positive(),
})

t.create('language count (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({ label: 'languages', message: 'repo not found' })
