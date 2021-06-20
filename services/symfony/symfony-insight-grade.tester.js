import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { sampleProjectUuid, noSymfonyToken } from './symfony-test-helpers.js'
export const t = await createServiceTester()

t.create('valid project grade')
  .skipWhen(noSymfonyToken)
  .get(`/${sampleProjectUuid}.json`)
  .timeout(15000)
  .expectBadge({
    label: 'grade',
    message: Joi.equal(
      'platinum',
      'gold',
      'silver',
      'bronze',
      'no medal'
    ).required(),
  })

t.create('nonexistent project')
  .skipWhen(noSymfonyToken)
  .get('/45afb680-d4e6-4e66-93ea-bcfa79eb8a88.json')
  .expectBadge({
    label: 'symfony insight',
    message: 'project not found',
  })
