import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { dockerBlue } from './docker-helpers.js'
export const t = await createServiceTester()

const isAutomatedBuildStatus = Joi.string().valid('automated', 'manual')

t.create('docker automated build (valid, library)')
  .get('/_/ubuntu.json')
  .expectBadge({
    label: 'docker build',
    message: isAutomatedBuildStatus,
  })

t.create('docker automated build (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker build',
    message: isAutomatedBuildStatus,
  })

t.create('docker automated build (not found)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'docker build', message: 'repo not found' })

t.create('docker automated build - automated')
  .get('/_/ubuntu.json')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu')
      .reply(200, { is_automated: true })
  )
  .expectBadge({
    label: 'docker build',
    message: 'automated',
    color: `#${dockerBlue}`,
  })

t.create('docker automated build - manual')
  .get('/_/ubuntu.json')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu')
      .reply(200, { is_automated: false })
  )
  .expectBadge({ label: 'docker build', message: 'manual', color: 'yellow' })
