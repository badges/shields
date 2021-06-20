import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('build status')
  .get('/pip.json')
  .expectBadge({
    label: 'docs',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build status for named version')
  .get('/pip/stable.json')
  .expectBadge({
    label: 'docs',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build status for named semantic version')
  .get('/scrapy/1.0.json')
  .expectBadge({
    label: 'docs',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build status for nonexistent version')
  // This establishes that the version is being sent.
  .get('/pip/foobar-is-not-a-version.json')
  .expectBadge({
    label: 'docs',
    message: 'project or version not found',
  })

t.create('unknown project')
  .get('/this-repo/does-not-exist.json')
  .expectBadge({ label: 'docs', message: 'project or version not found' })
