import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Downloads')
  .get('/AANobbMI.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (not found)')
  .get('/not-existing.json')
  .expectBadge({ label: 'downloads', message: 'not found', color: 'red' })

t.create('Downloads with negative downloads value')
  .get('/mocked.json')
  .intercept(nock =>
    nock('https://api.modrinth.com/api/v1/mod')
      .get('/mocked')
      .reply(200, { downloads: -1 })
  )
  .expectBadge({
    label: 'downloads',
    message: 'invalid response data',
    color: 'lightgray',
  })
