'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isPipeSeparatedPythonVersions = Joi.string().regex(
  /^([0-9]+\.[0-9]+(?: \| )?)+$/
)

t.create('python versions (valid, package version in request)')
  .get('/requests/2.18.4.json')
  .expectBadge({
    label: 'python',
    message: isPipeSeparatedPythonVersions,
  })

t.create('python versions (valid, no package version specified)')
  .get('/requests.json')
  .expectBadge({
    label: 'python',
    message: isPipeSeparatedPythonVersions,
  })

t.create(
  'python versions (valid, package version in request, experimental flag)'
)
  .get('/requests/2.18.4.json?experimental')
  .expectBadge({
    label: 'python',
    message: isPipeSeparatedPythonVersions,
  })

t.create(
  'python versions (valid, no package version specified, experimental flag)'
)
  .get('/requests.json?experimental')
  .expectBadge({
    label: 'python',
    message: isPipeSeparatedPythonVersions,
  })

t.create('python versions ("Only" classifier and others)')
  .get('/uvloop/0.12.1.json')
  .expectBadge({ label: 'python', message: '3.5 | 3.6 | 3.7' })

t.create('python versions ("Only" classifier only)')
  .get('/hashpipe/0.9.1.json')
  .expectBadge({ label: 'python', message: '3' })

t.create('python versions (no versions specified)')
  .get('/pyshp/1.2.12.json')
  .expectBadge({ label: 'python', message: 'missing' })

t.create('python versions (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'python', message: 'package or version not found' })
