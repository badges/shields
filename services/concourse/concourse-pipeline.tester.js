import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const base = 'https://ci.concourse-ci.org'
const jobsPath = '/api/v1/teams/main/pipelines/concourse/jobs'

t.create('pipeline status')
  .get(`/main/concourse.json?baseUrl=${base}`)
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('passing when every finished job succeeded')
  .get(`/main/concourse.json?baseUrl=${base}`)
  .intercept(nock =>
    nock(base)
      .get(jobsPath)
      .reply(200, [
        { finished_build: null },
        { finished_build: { status: 'succeeded' } },
        { finished_build: { status: 'succeeded' } },
      ]),
  )
  .expectBadge({ label: 'build', message: 'passing' })

t.create('failing when any finished job failed')
  .get(`/main/concourse.json?baseUrl=${base}`)
  .intercept(nock =>
    nock(base)
      .get(jobsPath)
      .reply(200, [
        { finished_build: { status: 'succeeded' } },
        { finished_build: { status: 'failed' } },
      ]),
  )
  .expectBadge({ label: 'build', message: 'failing' })

t.create('no finished builds')
  .get(`/main/concourse.json?baseUrl=${base}`)
  .intercept(nock =>
    nock(base)
      .get(jobsPath)
      .reply(200, [{ finished_build: null }]),
  )
  .expectBadge({ label: 'build', message: 'no builds' })

t.create('unknown pipeline')
  .get(`/main/does-not-exist.json?baseUrl=${base}`)
  .expectBadge({ label: 'build', message: 'pipeline not found' })
