'use strict'

const t = (module.exports = require('../tester').createServiceTester())

const mockResponse = {
  results: [
    {
      extensions: [
        {
          statistics: [
            {
              statisticName: 'install',
              value: 3,
            },
            {
              statisticName: 'updateCount',
              value: 7,
            },
          ],
          versions: [
            {
              version: '1.0.0',
            },
          ],
          publisher: {
            displayName: 'Yash T',
            publisherName: 'yasht',
          },
        },
      ],
    },
  ],
}

t.create('publisher id')
  .get('/visual-studio-marketplace/publisher/id/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'publisher id',
    message: 'yasht',
  })

t.create('publisher')
  .get(
    '/visual-studio-marketplace/publisher/name/yasht.terminal-all-in-one.json'
  )
  .expectBadge({
    label: 'publisher',
    message: 'Yash T',
  })

t.create('invalid extension id')
  .get(
    '/visual-studio-marketplace/publisher/name/yasht-terminal-all-in-one.json'
  )
  .expectBadge({
    label: 'publisher',
    message: 'invalid extension id',
  })

t.create('non existent extension')
  .get(
    '/visual-studio-marketplace/publisher/name/yasht.terminal-all-in-one-fake.json'
  )
  .expectBadge({
    label: 'publisher',
    message: 'extension not found',
  })

t.create('publisher id')
  .get('/visual-studio-marketplace/publisher/id/yasht.terminal-all-in-one.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectBadge({
    label: 'publisher id',
    message: 'yasht',
  })

t.create('publisher')
  .get(
    '/visual-studio-marketplace/publisher/name/yasht.terminal-all-in-one.json'
  )
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectBadge({
    label: 'publisher',
    message: 'Yash T',
  })
