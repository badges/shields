import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Docs with no version specified')
  .get('/tokio.json')
  .expectBadge({
    label: 'docs',
    message: Joi.allow('passing', 'failing'),
  })

t.create('Passing docs for version').get('/tokio/1.37.0.json').expectBadge({
  label: 'docs@1.37.0',
  message: 'passing',
  color: 'brightgreen',
})

t.create('Failing docs for version').get('/tokio/1.32.1.json').expectBadge({
  label: 'docs@1.32.1',
  message: 'failing',
  color: 'red',
})

t.create('Multiple builds, latest passing')
  .get('/bevy_tweening/0.3.1.json')
  .expectBadge({
    label: 'docs@0.3.1',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('Getting latest version works')
  .get('/rand/latest.json')
  .expectBadge({
    label: 'docs',
    message: Joi.allow('passing', 'failing'),
  })

t.create('Crate not found')
  .get('/not-a-crate/latest.json')
  .expectBadge({ label: 'docs', message: 'not found' })

t.create('Version not found')
  .get('/tokio/0.8.json')
  .expectBadge({ label: 'docs', message: 'not found' })

t.create('Malformed version')
  .get('/tokio/not-a-version.json')
  .expectBadge({ label: 'docs', message: 'malformed version' })
