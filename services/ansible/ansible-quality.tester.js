import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'AnsibleGalaxyContentQualityScore',
  title: 'AnsibleGalaxyContentQualityScore',
  pathPrefix: '/ansible/quality',
})

t.create('quality score')
  .get('/432.json')
  .expectBadge({ label: 'quality', message: 'no longer available' })
