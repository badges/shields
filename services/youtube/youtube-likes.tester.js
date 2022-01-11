import { createServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import { isMetric } from '../test-validators.js'
import _noYouTubeToken from './youtube-likes.service.js'
export const t = await createServiceTester()
const noYouTubeToken = noToken(_noYouTubeToken)

t.create('video like count')
  .skipWhen(noYouTubeToken)
  .get('/pU9Q6oiQNd0.json')
  .expectBadge({
    label: 'likes',
    message: isMetric,
    color: 'red',
    link: ['https://www.youtube.com/video/pU9Q6oiQNd0'],
  })

t.create('video not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'video not found',
    color: 'red',
  })
