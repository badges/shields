import {ServiceTester} from '../tester.js';

const t = new ServiceTester({ id: 'snap-ci', title: 'Snap CI' })
export default t;

t.create('no longer available (previously build state)')
  .get('/snap-ci/ThoughtWorksStudios/eb_deployer/master.json')
  .expectBadge({
    label: 'snap ci',
    message: 'no longer available',
  })
