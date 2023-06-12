import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
import { noToken } from '../test-helpers.js'
import CurseForgeDownloads from './curseforge-downloads.service.js'

export const t = await createServiceTester()
const noApiKey = noToken(CurseForgeDownloads)

t.create('Downloads')
  .skipWhen(noApiKey)
  .get('/238222.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (empty)')
  .skipWhen(noApiKey)
  .get('/872620.json')
  .expectBadge({ label: 'downloads', message: '0' })

t.create('Downloads (not found)')
  .skipWhen(noApiKey)
  .get('/invalid-project-id.json')
  .expectBadge({ label: 'downloads', message: 'not found', color: 'red' })
