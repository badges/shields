import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Game Versions')
  .get('/jmp/MiniMOTD.json')
  .expectBadge({
    label: 'game versions',
    // Found from https://stackoverflow.com/a/72900791
    // https://regexr.com/3er1i
    message: withRegex(
      /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/
    ),
  })

t.create('Game Versions (not found)')
  .get('/GeyserMC/not-existing.json')
  .expectBadge({ label: 'game versions', message: 'not found', color: 'red' })
