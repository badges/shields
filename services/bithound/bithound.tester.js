import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'bithound',
  title: 'BitHound',
})

t.create('no longer available (code)')
  .get('/code/github/rexxars/sse-channel.json')
  .expectBadge({
    label: 'bithound',
    message: 'no longer available',
  })

t.create('no longer available (dependencies)')
  .get('/dependencies/github/rexxars/sse-channel.json')
  .expectBadge({
    label: 'bithound',
    message: 'no longer available',
  })

t.create('no longer available (devDpendencies)')
  .get('/devDependencies/github/rexxars/sse-channel.json')
  .expectBadge({
    label: 'bithound',
    message: 'no longer available',
  })
