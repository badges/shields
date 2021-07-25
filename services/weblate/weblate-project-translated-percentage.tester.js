import { createServiceTester } from '../tester.js'
import { isPercentage } from '../test-validators.js'
export const t = await createServiceTester()

t.create('License')
  .get('/godot-engine.json')
  .expectBadge({ label: 'translated', message: isPercentage })

t.create('Not Valid')
  .get('/fake-project.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'translated', message: 'project not found' })
