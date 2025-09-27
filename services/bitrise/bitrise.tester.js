import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('deploy status')
  .get('/9fa2e96dc9458fbb.json?token=iAJgn0FMJzmMP4ALCi0KdQ')
  .expectBadge({
    label: 'bitrise',
    message: isBuildStatus,
  })

t.create('deploy status with branch')
  .get('/9fa2e96dc9458fbb/master.json?token=iAJgn0FMJzmMP4ALCi0KdQ')
  .expectBadge({
    label: 'bitrise',
    message: isBuildStatus,
  })

t.create('unknown branch')
  .get('/9fa2e96dc9458fbb/unknown.json?token=iAJgn0FMJzmMP4ALCi0KdQ')
  .expectBadge({ label: 'bitrise', message: 'branch not found' })

t.create('invalid token')
  .get('/9fa2e96dc9458fbb/unknown.json?token=token')
  .expectBadge({ label: 'bitrise', message: 'app not found or invalid token' })

t.create('invalid App ID')
  .get('/invalid/develop.json?token=iAJgn0FMJzmMP4ALCi0KdQ')
  .expectBadge({ label: 'bitrise', message: 'app not found or invalid token' })
