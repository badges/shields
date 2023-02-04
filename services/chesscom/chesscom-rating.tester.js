import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('rapid player rating').get('/rapid/alexandresanlim.json').expectBadge({
  label: 'rating',
  message: isMetric,
  color: 'blue',
})

t.create('bullet player rating').get('/bullet/hikaru.json').expectBadge({
  label: 'rating',
  message: isMetric,
  color: 'blue',
})

t.create('blitz player rating').get('/blitz/hikaru.json').expectBadge({
  label: 'rating',
  message: isMetric,
  color: 'blue',
})

t.create('invalid game type')
  .get('/invalidgametype/alexandresanlim.json')
  .expectBadge({
    label: 'rating',
    message: 'invalid game type, try rapid or bullet or blitz',
    color: 'red',
  })

t.create('data not found').get('/rapid/not-a-valid-user.json').expectBadge({
  label: 'rating',
  message: 'data not found',
  color: 'red',
})
