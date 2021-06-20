import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Note that Spigot versions can be anything (including just a string), so we'll make sure it's not returning 'not found'

t.create('EssentialsX (id 9089)')
  .get('/9089.json')
  .expectBadge({
    label: 'spiget',
    message: withRegex(/^(?!not found$)/),
  })

t.create('Invalid Resource (id 1)').get('/1.json').expectBadge({
  label: 'spiget',
  message: 'not found',
})
