import { createServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import { isMetric } from '../test-validators.js'
import _noYouTubeToken from './youtube-comments.service.js'
export const t = await createServiceTester()
const noYouTubeToken = noToken(_noYouTubeToken)

t.create('video comment count')
  .skipWhen(noYouTubeToken)
  .get('/wGJHwc5ksMA.json')
  .expectBadge({
    label: 'comments',
    message: isMetric,
    color: 'red',
    link: ['https://www.youtube.com/video/wGJHwc5ksMA'],
  })

t.create('video not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'video not found',
    color: 'red',
  })
