import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import _noTwitchToken from './twitch.service.js'
const noTwitchToken = noToken(_noTwitchToken)
export const t = await createServiceTester()

t.create('gets the released version of Schedule with Google Calendar')
  .skipWhen(noTwitchToken)
  .get('/2nq5cu1nc9f4p75b791w8d3yo9d195.json')
  .expectBadge({ label: 'twitch extension', message: isSemver })

t.create('invalid extension id')
  .skipWhen(noTwitchToken)
  .get('/will-never-exist.json')
  .expectBadge({ label: 'twitch extension', message: 'not found' })
