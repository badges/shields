import { createServiceTester } from '../../tester.js'
import { isMetric } from '../../test-validators.js'

export const t = await createServiceTester()

t.create('Gist Total Stars')
  .get('/47a4d00457a92aa426dbd48a18776322.json')
  .expectBadge({
    label: 'Stars',
    message: isMetric,
    color: 'blue',
    link: [
      'https://gist.github.com/47a4d00457a92aa426dbd48a18776322',
      'https://gist.github.com/maratori/47a4d00457a92aa426dbd48a18776322/stargazers',
    ],
  })

t.create('Gist Total Stars (Not Found)')
  .get('/invalid-gist-id.json')
  .expectBadge({
    label: 'Stars',
    message: 'gist not found',
    color: 'red',
    link: [],
  })
