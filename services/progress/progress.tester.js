import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('percentage: integer 0-100')
  .get('.json?percentage=75&gradient=red-green')
  .expectBadge({
    label: 'progress',
    message: '75%',
    color: Joi.string().regex(/^#[0-9a-f]{3,6}$/i),
  })

t.create('percentage: decimal 0-1')
  .get('.json?percentage=0.75&gradient=red-green')
  .expectBadge({
    label: 'progress',
    message: '75%',
    color: Joi.string().regex(/^#[0-9a-f]{3,6}$/i),
  })

t.create('numerator and denominator')
  .get('.json?numerator=4&denominator=5&gradient=red-yellow-green')
  .expectBadge({
    label: 'progress',
    message: '80%',
    color: Joi.string().regex(/^#[0-9a-f]{3,6}$/i),
  })

t.create('custom label and message')
  .get('.json?label=Docs&message=Good&percentage=90&gradient=green-red')
  .expectBadge({
    label: 'Docs',
    message: 'Good',
    color: Joi.string().regex(/^#[0-9a-f]{3,6}$/i),
  })

t.create('0% - red in red-green gradient')
  .get('.json?percentage=0&gradient=red-green')
  .expectBadge({
    label: 'progress',
    message: '0%',
    color: Joi.string().regex(/^#[0-9a-f]{3,6}$/i),
  })

t.create('100% - green in red-green gradient')
  .get('.json?percentage=100&gradient=red-green')
  .expectBadge({
    label: 'progress',
    message: '100%',
    color: Joi.string().regex(/^#[0-9a-f]{3,6}$/i),
  })

t.create('missing percentage and numerator')
  .get('.json?gradient=red-green')
  .expectBadge({
    label: 'progress',
    message: 'percentage or numerator+denominator required',
    color: 'red',
  })

t.create('numerator without denominator').get('.json?numerator=5').expectBadge({
  label: 'progress',
  message: 'numerator and denominator required together',
  color: 'red',
})
