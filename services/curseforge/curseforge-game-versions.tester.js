import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'
import { noToken } from '../test-helpers.js'
import CurseForgeGameVersions from './curseforge-game-versions.service.js'

export const t = await createServiceTester()
const noApiKey = noToken(CurseForgeGameVersions)

t.create('Game Versions')
  .skipWhen(noApiKey)
  .get('/238222.json')
  .expectBadge({ label: 'game versions', message: withRegex(/.+( \| )?/) })

t.create('Game Versions (empty)')
  .skipWhen(noApiKey)
  .get('/872620.json')
  .expectBadge({ label: 'game versions', message: 'N/A', color: 'blue' })

t.create('Game Versions (not found)')
  .skipWhen(noApiKey)
  .get('/invalid-project-id.json')
  .expectBadge({ label: 'game versions', message: 'not found', color: 'red' })
