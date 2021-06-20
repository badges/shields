import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { isSemver } from '../test-validators.js'
export const t = await createServiceTester()

const isPsycopg2Version = Joi.string().regex(/^v([0-9][.]?)+$/)

/*
  Note:
  Not all project on PyPi follow SemVer

  Versions strings like
  - 2.7.3.2
  - 2.0rc1
  - 0.1.30b10
  are perfectly legal.

  We'll run this test against a project that follows SemVer...
*/
t.create('version (semver)').get('/requests.json').expectBadge({
  label: 'pypi',
  message: isSemver,
})

// ..whereas this project does not folow SemVer
t.create('version (not semver)').get('/psycopg2.json').expectBadge({
  label: 'pypi',
  message: isPsycopg2Version,
})

t.create('version (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'pypi', message: 'package or version not found' })

t.create('no trove classifiers')
  .get('/mapi.json')
  .intercept(nock =>
    nock('https://pypi.org')
      .get('/pypi/mapi/json')
      .reply(200, {
        info: {
          version: '1.2.3',
          license: 'foo',
          classifiers: [],
        },
        releases: {},
      })
  )
  .expectBadge({
    label: 'pypi',
    message: 'v1.2.3',
  })
