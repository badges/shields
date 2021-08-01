import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Stars')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    link: [
      'https://github.com/badges/shields',
      'https://github.com/badges/shields/stargazers',
    ],
  })

t.create('Stars (repo not found)').get('/badges/helmets.json').expectBadge({
  label: 'stars',
  message: 'repo not found',
})

// https://github.com/badges/shields/issues/4982
// It doesn't seem important that this work with trailing spaces, though if it
// did we'd probably want a more global fix.
t.create('Stars (repo name with trailing spaces)')
  .get('/badges/shields     .json')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    link: [
      'https://github.com/badges/shields%20%20%20%20%20',
      'https://github.com/badges/shields%20%20%20%20%20/stargazers',
    ],
  })
