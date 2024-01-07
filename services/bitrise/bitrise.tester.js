import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('deploy status')
  .get('/4a2b10a819d12b67.json?token=859FMDR8QHwabCzwvZK6vQ')
  .expectBadge({
    label: 'bitrise',
    message: isBuildStatus,
  })

t.create('deploy status with branch')
  .get('/4a2b10a819d12b67/master.json?token=859FMDR8QHwabCzwvZK6vQ')
  .expectBadge({
    label: 'bitrise',
    message: isBuildStatus,
  })

t.create('unknown branch')
  .get('/cde737473028420d/unknown.json?token=GCIdEzacE4GW32jLVrZb7A')
  .expectBadge({ label: 'bitrise', message: 'branch not found' })

t.create('invalid token')
  .get('/cde737473028420d/unknown.json?token=token')
  .expectBadge({ label: 'bitrise', message: 'app not found or invalid token' })

t.create('invalid App ID')
  .get('/invalid/master.json?token=GCIdEzacE4GW32jLVrZb7A')
  .expectBadge({ label: 'bitrise', message: 'app not found or invalid token' })
