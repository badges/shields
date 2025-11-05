import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'codeclimate',
  title: 'CodeClimate',
  pathPrefix: '/codeclimate',
})

t.create('test coverage')
  .get('/coverage/codeclimate/codeclimate.json')
  .expectBadge({
    label: 'codeclimate',
    message: 'no longer available',
  })
