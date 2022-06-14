import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Rating Count')
  .get('/rating-count/407466.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+?\stotal$/),
  })

t.create('Good Rating Count')
  .get('/good-rating-count/407466.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+?\sgood$/),
  })

t.create('Ok Rating Count')
  .get('/ok-rating-count/407466.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+?\sok$/),
  })

t.create('Bad Rating Count')
  .get('/bad-rating-count/407466.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+?\sbad$/),
  })

t.create('Rating Count (not found)')
  .get('/rating-count/000000.json')
  .expectBadge({ label: 'rating', message: 'not found' })
