import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Shields colorscheme color')
  .get('/badge/label-message-blue.json')
  .expectBadge({ label: 'label', message: 'message', color: 'blue' })

t.create('CSS named color')
  .get('/badge/label-message-whitesmoke.json')
  .expectBadge({ label: 'label', message: 'message', color: 'whitesmoke' })

t.create('RGB color')
  .get('/badge/label-message-rgb(123,123,123).json')
  .expectBadge({
    label: 'label',
    message: 'message',
    color: 'rgb(123,123,123)',
  })

t.create('All one color')
  .get('/badge/all%20one%20color-red.json')
  .expectBadge({ label: '', message: 'all one color', color: 'red' })

t.create('Not a valid color')
  .get('/badge/label-message-notacolor.json')
  .expectBadge({
    label: 'label',
    message: 'message',
    color: Joi.forbidden(),
  })

t.create('Missing message')
  .get('/badge/label--blue.json')
  .expectBadge({ label: 'label', message: '', color: 'blue' })

t.create('Missing label')
  .get('/badge/-message-blue.json')
  .expectBadge({ label: '', message: 'message', color: 'blue' })

t.create('Case is preserved')
  .get('/badge/LiCeNsE-mIt-blue.json')
  .expectBadge({ label: 'LiCeNsE', message: 'mIt', color: 'blue' })

t.create('"Shields-encoded" dash')
  .get('/badge/best--license-Apache--2.0-blue.json')
  .expectBadge({ label: 'best-license', message: 'Apache-2.0', color: 'blue' })

t.create('Override color')
  .get('/badge/label-message-blue.json?color=yellow')
  .expectBadge({ label: 'label', message: 'message', color: 'yellow' })

t.create('Override color (legacy)')
  .get('/badge/label-message-blue.json?colorB=yellow')
  .expectBadge({ label: 'label', message: 'message', color: 'yellow' })

t.create('Override color with a number')
  .get('/badge/label-message-blue.json?color=123')
  .expectBadge({ label: 'label', message: 'message', color: '#123' })

t.create('Override label')
  .get('/badge/label-message-blue.json?label=mylabel')
  .expectBadge({ label: 'mylabel', message: 'message', color: 'blue' })
