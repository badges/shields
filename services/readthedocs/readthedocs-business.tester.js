import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { buildsQuery } from './readthedocs-common.js'

export const t = await createServiceTester()

const apiBaseUrl = 'https://app.readthedocs.com'

const passingBuild = {
  state: { code: 'finished' },
  success: true,
}

const failingBuild = {
  state: { code: 'finished' },
  success: false,
}

t.create('build status for a public business project')
  .get('/dkistdc-dkist.json')
  .expectBadge({ label: 'docs', message: Joi.equal('passing', 'failing') })

t.create('passing build for a named version')
  .get('/dkistdc-dkist/latest.json')
  .intercept(nock =>
    nock(apiBaseUrl)
      .get('/api/v3/projects/dkistdc-dkist/versions/latest/builds/')
      .query(buildsQuery)
      .reply(200, { results: [passingBuild] }),
  )
  .expectBadge({ label: 'docs', message: 'passing' })

t.create('failing build for a named version')
  .get('/example/1.0.json')
  .intercept(nock =>
    nock(apiBaseUrl)
      .get('/api/v3/projects/example/versions/1.0/builds/')
      .query(buildsQuery)
      .reply(200, { results: [failingBuild] }),
  )
  .expectBadge({ label: 'docs', message: 'failing' })

t.create('no finished builds')
  .get('/example/unbuilt.json')
  .intercept(nock =>
    nock(apiBaseUrl)
      .get('/api/v3/projects/example/versions/unbuilt/builds/')
      .query(buildsQuery)
      .reply(200, { results: [] }),
  )
  .expectBadge({ label: 'docs', message: 'no finished builds' })
