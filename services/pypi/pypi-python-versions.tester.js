import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isPipeSeparatedPythonVersions = Joi.string().regex(
  /^([1-9]\.[0-9]+(?: \| )?)+$/
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

t.create('python versions ("Only" and others)')
  .get('/uvloop/0.12.1.json')
  .expectBadge({ label: 'python', message: '3.5 | 3.6 | 3.7' })

t.create('python versions ("Only" only)')
  .get('/hashpipe/0.9.1.json')
  .expectBadge({ label: 'python', message: '3' })

t.create('python versions (no versions specified)')
  .get('/pyshp/1.2.12.json')
  .expectBadge({ label: 'python', message: 'missing' })

t.create('python versions (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'python', message: 'package or version not found' })
