import { isStarRating, withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Stars - EssentialsX (id 9089)').get('/stars/9089.json').expectBadge({
  label: 'rating',
  message: isStarRating,
})

t.create('Stars - Invalid Resource (id 1)').get('/stars/1.json').expectBadge({
  label: 'rating',
  message: 'not found',
})

t.create('Rating - EssentialsX (id 9089)')
  .get('/rating/9089.json')
  .expectBadge({
    label: 'rating',
    message: withRegex(/^(\d*\.\d+)(\/5 \()(\d+)(\))$/),
  })

t.create('Rating - Invalid Resource (id 1)').get('/rating/1.json').expectBadge({
  label: 'rating',
  message: 'not found',
})
