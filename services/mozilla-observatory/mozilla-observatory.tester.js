import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isMessage = Joi.alternatives()
  .try(Joi.string().regex(/^[ABCDEF][+-]? \([0-9]{1,3}\/100\)$/))
  .required()

t.create('valid').get('/grade-score/observatory.mozilla.org.json').expectBadge({
  label: 'observatory',
  message: isMessage,
})

t.create('invalid')
  .get('/grade-score/invalidsubdomain.shields.io.json')
  .expectBadge({
    label: 'observatory',
    message: 'invalid',
  })
