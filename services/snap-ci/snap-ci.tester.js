import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({ id: 'snap-ci', title: 'Snap CI' })

t.create('no longer available (previously build state)')
  .get('/snap-ci/ThoughtWorksStudios/eb_deployer/master.json')
  .expectBadge({
    label: 'snap ci',
    message: 'no longer available',
  })
