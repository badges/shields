import { isStarRating, withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Stars - Polymart Plugin (id 323)')
  .get('/stars/323.json')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
  })

t.create('Stars - Invalid Resource (id 1)').get('/stars/1.json').expectBadge({
  label: 'rating',
  message: 'not found',
})

t.create('Rating - Polymart Plugin (id 323)')
  .get('/rating/323.json')
  .expectBadge({
    label: 'rating',
    message: withRegex(/^(\d*\.\d+)(\/5 \()(\d+)(\))$/),
  })

t.create('Rating - Invalid Resource (id 1)').get('/rating/1.json').expectBadge({
  label: 'rating',
  message: 'not found',
})
