import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Valid Repository')
  .get('/wireshark/wireshark.json')
  .expectBadge({
    label: 'c',
    message: Joi.string().regex(/^([1-9]?[0-9]\.[0-9]|100\.0)%$/),
  })

t.create('Valid Blank Repo')
  .get('/KoruptTinker/gitlab-blank-repo.json')
  .expectBadge({
    label: 'language',
    message: 'no languages found',
  })

t.create('Invalid Repository')
  .get('/wireshark/invalidexample.json')
  .expectBadge({
    label: 'language',
    message: 'project not found',
  })
