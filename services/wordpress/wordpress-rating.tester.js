import { ServiceTester } from '../tester.js'
import { isStarRating } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'wordpress',
  title: 'WordPress Rating Tests',
})

t.create('Plugin Rating - Stars')
  .get('/plugin/stars/akismet.json')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
  })

t.create('Plugin Rating - Stars | Not Found')
  .get('/plugin/stars/100.json')
  .expectBadge({
    label: 'rating',
    message: 'not found',
  })

t.create('Plugin Rating - Stars (Alias)')
  .get('/plugin/r/akismet.json')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
  })

t.create('Plugin Rating - Stars (Alias) | Not Found')
  .get('/plugin/r/100.json')
  .expectBadge({
    label: 'rating',
    message: 'not found',
  })

t.create('Theme Rating - Stars')
  .get('/theme/stars/twentyseventeen.json')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
  })

t.create('Theme Rating - Stars | Not Found')
  .get('/theme/stars/100.json')
  .expectBadge({
    label: 'rating',
    message: 'not found',
  })

t.create('Theme Rating - Stars (Alias)')
  .get('/theme/r/twentyseventeen.json')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
  })

t.create('Theme Rating - Stars (Alias) | Not Found')
  .get('/theme/r/100.json')
  .expectBadge({
    label: 'rating',
    message: 'not found',
  })
