import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { dockerBlue } from './docker-helpers.js'
export const t = await createServiceTester()

const isAutomatedBuildStatus = Joi.string().valid('automated', 'manual')

t.create('docker cloud automated build (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker build',
    message: isAutomatedBuildStatus,
  })

t.create('docker cloud automated build (not found)')
  .get('/badges/not-a-real-repo.json')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get(
        `/api/build/v1/source?image=${encodeURIComponent(
          'badges/not-a-real-repo'
        )}`
      )
      .reply(404, { detail: 'Object not found' })
  )
  .expectBadge({ label: 'docker build', message: 'repo not found' })

t.create('docker cloud automated build - automated')
  .get('/xenolf/lego.json')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get(`/api/build/v1/source?image=${encodeURIComponent('xenolf/lego')}`)
      .reply(200, { objects: [{ build_settings: ['test1'] }] })
  )
  .expectBadge({
    label: 'docker build',
    message: 'automated',
    color: `#${dockerBlue}`,
  })

t.create('docker cloud automated build - manual')
  .get('/xenolf/lego.json')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get(`/api/build/v1/source?image=${encodeURIComponent('xenolf/lego')}`)
      .reply(200, { objects: [{ build_settings: [] }] })
  )
  .expectBadge({ label: 'docker build', message: 'manual', color: 'yellow' })
