import { createServiceTester } from '../tester.js'
import { withRegex, isStarRating } from '../test-validators.js'
export const t = await createServiceTester()

const isVscodeRating = withRegex(/[0-5]\.[0-9]{1}\/5?\s*\([0-9]*\)$/)

t.create('rating invalid extension')
  .get('/rating/badges/shields.json')
  .expectBadge({
    label: 'rating',
    message: 'extension not found',
  })

t.create('rating').get('/rating/redhat/java.json').expectBadge({
  label: 'rating',
  message: isVscodeRating,
})

t.create('stars invalid extension')
  .get('/stars/badges/shields.json')
  .expectBadge({
    label: 'rating',
    message: 'extension not found',
  })

t.create('stars').get('/stars/redhat/java.json').expectBadge({
  label: 'rating',
  message: isStarRating,
})
