import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'
import { noToken } from '../test-helpers.js'
import CurseForgeVersion from './curseforge-version.service.js'

export const t = await createServiceTester()
const noApiKey = noToken(CurseForgeVersion)

t.create('Version')
  .skipWhen(noApiKey)
  .get('/238222.json')
  .expectBadge({ label: 'version', message: withRegex(/.+/) })

t.create('Version (empty)')
  .skipWhen(noApiKey)
  .get('/872620.json')
  .expectBadge({ label: 'version', message: 'N/A', color: 'blue' })

t.create('Version (not found)')
  .skipWhen(noApiKey)
  .get('/invalid-project-id.json')
  .expectBadge({ label: 'version', message: 'not found', color: 'red' })
