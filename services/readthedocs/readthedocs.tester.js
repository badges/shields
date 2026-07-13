import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const apiBaseUrl = 'https://app.readthedocs.org'
const buildsQuery = {
  fields: 'state,success',
  limit: 10,
  running: false,
}

const passingBuild = {
  state: { code: 'finished' },
  success: true,
}

const failingBuild = {
  state: { code: 'finished' },
  success: false,
}

t.create('defaults to the latest version')
  .get('/pip.json')
  .expectBadge({ label: 'docs', message: Joi.equal('passing', 'failing') })

t.create('passing build for a named version')
  .get('/pip/stable.json')
  .intercept(nock =>
    nock(apiBaseUrl)
      .get('/api/v3/projects/pip/versions/stable/builds/')
      .query(buildsQuery)
      .reply(200, { results: [passingBuild] }),
  )
  .expectBadge({ label: 'docs', message: 'passing' })

t.create('failing build for a named version')
  .get('/scrapy/1.0.json')
  .intercept(nock =>
    nock(apiBaseUrl)
      .get('/api/v3/projects/scrapy/versions/1.0/builds/')
      .query(buildsQuery)
      .reply(200, { results: [failingBuild] }),
  )
  .expectBadge({ label: 'docs', message: 'failing' })

t.create('uses the latest finished build')
  .get('/pip/latest.json')
  .intercept(nock =>
    nock(apiBaseUrl)
      .get('/api/v3/projects/pip/versions/latest/builds/')
      .query(buildsQuery)
      .reply(200, {
        results: [
          { state: { code: 'cancelled' }, success: false },
          passingBuild,
        ],
      }),
  )
  .expectBadge({ label: 'docs', message: 'passing' })

t.create('no finished builds')
  .get('/pip/unbuilt.json')
  .intercept(nock =>
    nock(apiBaseUrl)
      .get('/api/v3/projects/pip/versions/unbuilt/builds/')
      .query(buildsQuery)
      .reply(200, { results: [] }),
  )
  .expectBadge({ label: 'docs', message: 'project or version not found' })

t.create('project or version not found')
  .get('/this-repo/does-not-exist.json')
  .intercept(nock =>
    nock(apiBaseUrl)
      .get('/api/v3/projects/this-repo/versions/does-not-exist/builds/')
      .query(buildsQuery)
      .reply(404),
  )
  .expectBadge({ label: 'docs', message: 'project or version not found' })
