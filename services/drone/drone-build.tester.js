import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isDroneBuildStatus = Joi.alternatives().try(
  isBuildStatus,
  Joi.equal('none'),
  Joi.equal('killed')
)

t.create('cloud-hosted build status on default branch')
  .get('/harness/drone.json')
  .expectBadge({
    label: 'build',
    message: isDroneBuildStatus,
  })

t.create('cloud-hosted build status on named branch')
  .get('/harness/drone/master.json')
  .expectBadge({
    label: 'build',
    message: isDroneBuildStatus,
  })

t.create('cloud-hosted build status on unknown repo')
  .get('/this-repo/does-not-exist.json')
  .expectBadge({
    label: 'build',
    message: 'repo not found or not authorized',
  })

t.create('self-hosted build status on default branch')
  .get('/badges/shields.json?server=https://drone.shields.io')
  .intercept(nock =>
    nock('https://drone.shields.io/api/repos')
      .get('/badges/shields/builds/latest')
      .reply(200, { status: 'success' })
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
  })

t.create('self-hosted build status on named branch')
  .get(
    '/badges/shields/feat/awesome-thing.json?server=https://drone.shields.io'
  )
  .intercept(nock =>
    nock('https://drone.shields.io/api/repos')
      .get('/badges/shields/builds/latest')
      .query({ ref: 'refs/heads/feat/awesome-thing' })
      .reply(200, { status: 'success' })
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
  })
