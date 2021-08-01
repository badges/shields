import { createServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import { isMetric } from '../test-validators.js'
import _noYouTubeToken from './youtube-subscribers.service.js'
export const t = await createServiceTester()
const noYouTubeToken = noToken(_noYouTubeToken)

t.create('subscriber count')
  .skipWhen(noYouTubeToken)
  .get('/UC8butISFwT-Wl7EV0hUK0BQ.json')
  .expectBadge({
    label: 'subscribers',
    message: isMetric,
    color: 'red',
    link: ['https://www.youtube.com/channel/UC8butISFwT-Wl7EV0hUK0BQ'],
  })

t.create('channel not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'channel not found',
    color: 'red',
  })
