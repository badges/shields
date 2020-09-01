'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isIntegerPercentage } = require('../test-validators')

t.create('Overall progress')
  .get(
    '/5cc34208-0418-40b1-8353-acc70c95f802.json?token=0f4d5e31a44f48dcbab966c52cfb0a67c5f1982186c14b85ab389a031dbc225a'
  )
  .expectBadge({ label: 'localized', message: isIntegerPercentage })

t.create('Overall progress on specific branch')
  .get(
    '/5cc34208-0418-40b1-8353-acc70c95f802/Version_1.0.json?token=0f4d5e31a44f48dcbab966c52cfb0a67c5f1982186c14b85ab389a031dbc225a'
  )
  .expectBadge({ label: 'localized', message: isIntegerPercentage })

t.create('Overall progress with invalid token')
  .get(
    '/1349592f-8d05-4317-9f46-bddc5def11fe/main.json?token=312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715'
  )
  .intercept(nock =>
    nock('https://api.localizely.com', {
      reqheaders: {
        accept: 'application/json',
        'x-api-token':
          '312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715',
      },
    })
      .get('/v1/projects/1349592f-8d05-4317-9f46-bddc5def11fe/status')
      .query({ branch: 'main' })
      .reply(403, {
        errorCode: 'forbidden',
        errorMessage: 'Tried to access unauthorized project',
      })
  )
  .expectBadge({ label: 'other', message: 'forbidden' })
