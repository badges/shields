import { createServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import { isMetric } from '../test-validators.js'
import _noYouTubeToken from './youtube-views.service.js'
export const t = await createServiceTester()
const noYouTubeToken = noToken(_noYouTubeToken)

t.create('video view count')
  .skipWhen(noYouTubeToken)
  .get('/abBdk8bSPKU.json')
  .expectBadge({
    label: 'views',
    message: isMetric,
    color: 'red',
    link: ['https://www.youtube.com/video/abBdk8bSPKU'],
  })

t.create('video not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'video not found',
    color: 'red',
  })
