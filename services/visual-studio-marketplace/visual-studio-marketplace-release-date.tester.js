'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isFormattedDate } = require('../test-validators')

t.create('date')
  .get('/visual-studio-marketplace/release-date/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'release date',
    message: isFormattedDate,
  })

t.create('date')
  .get('/visual-studio-marketplace/release-date/yasht.terminal-all-in-one.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, {
        results: [
          {
            extensions: [
              {
                statistics: [
                  {
                    statisticName: 'averagerating',
                    value: 2.5,
                  },
                  {
                    statisticName: 'ratingcount',
                    value: 10,
                  },
                ],
                versions: [
                  {
                    version: '1.0.0',
                  },
                ],
                releaseDate: '2013-04-13T07:50:27.000Z',
                lastUpdated: '2019-04-13T07:50:27.000Z',
              },
            ],
          },
        ],
      })
  )
  .expectBadge({
    label: 'release date',
    message: 'april 2013',
    color: 'red',
  })

t.create('invalid extension id')
  .get('/visual-studio-marketplace/release-date/yasht-terminal-all-in-one.json')
  .expectBadge({
    label: 'release date',
    message: 'invalid extension id',
  })

t.create('non existent extension')
  .get(
    '/visual-studio-marketplace/release-date/yasht.terminal-all-in-one-fake.json'
  )
  .expectBadge({
    label: 'release date',
    message: 'extension not found',
  })

t.create('invalid')
  .get('/visual-studio-marketplace/release-date/yasht.terminal-all-in-one.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(401)
  )
  .expectBadge({
    label: 'release date',
    message: 'invalid',
    color: 'lightgrey',
  })
