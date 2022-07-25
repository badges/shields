import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isPipeSeparatedPloneVersions = Joi.string().regex(
  /^([1-9]\.[0-9]+(?: \| )?)+$/
)

t.create('supported plone versions (valid, package version in request)')
  .get('/plone.volto/4.0.0a7.json')
  .expectBadge({
    label: 'plone versions',
    message: isPipeSeparatedPloneVersions,
  })

t.create('supported plone versions (valid, no package version specified)')
  .get('/plone.volto.json')
  .expectBadge({
    label: 'plone versions',
    message: isPipeSeparatedPloneVersions,
  })

t.create('supported plone versions (for Plone Package )')
  .get('/plone/5.2.9.json')
  .expectBadge({
    label: 'plone versions',
    message: isPipeSeparatedPloneVersions,
  })

t.create('supported plone versions (invalid)')
  .get('/not-a-package.json')
  .expectBadge({
    label: 'plone versions',
    message: 'package or version not found',
  })
