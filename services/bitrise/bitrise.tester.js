import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('deploy status')
  .get('/e736852157296019.json?token=vhgAmaiF3tWZoQyFLkKM7g')
  .expectBadge({
    label: 'bitrise',
    message: isBuildStatus,
  })

t.create('deploy status with branch')
  .get('/e736852157296019/develop.json?token=vhgAmaiF3tWZoQyFLkKM7g')
  .expectBadge({
    label: 'bitrise',
    message: isBuildStatus,
  })

t.create('unknown branch')
  .get('/e736852157296019/unknown.json?token=vhgAmaiF3tWZoQyFLkKM7g')
  .expectBadge({ label: 'bitrise', message: 'branch not found' })

t.create('invalid token')
  .get('/e736852157296019/unknown.json?token=token')
  .expectBadge({ label: 'bitrise', message: 'app not found or invalid token' })

t.create('invalid App ID')
  .get('/invalid/develop.json?token=vhgAmaiF3tWZoQyFLkKM7g')
  .expectBadge({ label: 'bitrise', message: 'app not found or invalid token' })
