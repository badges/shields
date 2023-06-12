import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Passing docs')
  .get('/tokio/0.3.0.json')
  .expectBadge({ label: 'docs@0.3.0', message: 'passing' })

t.create('Failing docs')
  .get('/tensorflow/0.16.1.json')
  .expectBadge({ label: 'docs@0.16.1', message: 'failing' })

t.create('Multiple builds, latest passing')
  .get('/bevy_tweening/0.3.1.json')
  .expectBadge({ label: 'docs@0.3.1', message: 'passing' })

t.create('Getting latest version works')
  .get('/rand/latest.json')
  .expectBadge({
    label: 'docs',
    message: Joi.allow('passing', 'failing'),
  })
