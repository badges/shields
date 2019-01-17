'use strict'

const Joi = require('joi')
const t = (module.exports = require('../create-service-tester')())
const { withRegex, isStarRating } = require('../test-validators')

const isVscodeRating = withRegex(/[0-5].[0-9]{2}\/5?\s*\([0-9]*\)$/)

t.create('live: rating')
  .get('/visual-studio-marketplace/r/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isVscodeRating,
    })
  )

t.create('live: stars')
  .get('/visual-studio-marketplace/stars/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )

t.create('rating')
  .get(
    '/visual-studio-marketplace/r/ritwickdey.LiveServer.json?style=_shields_test'
  )
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
              },
            ],
          },
        ],
      })
  )
  .expectJSON({
    name: 'rating',
    value: '2.5/5 (10)',
    color: 'yellowgreen',
  })

t.create('zero rating')
  .get(
    '/visual-studio-marketplace/r/ritwickdey.LiveServer.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, {
        results: [
          {
            extensions: [
              {
                statistics: [],
                versions: [
                  {
                    version: '1.0.0',
                  },
                ],
              },
            ],
          },
        ],
      })
  )
  .expectJSON({
    name: 'rating',
    value: '0/5 (0)',
    color: 'red',
  })

t.create('stars')
  .get(
    '/visual-studio-marketplace/stars/ritwickdey.LiveServer.json?style=_shields_test'
  )
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
                    value: 4.7,
                  },
                  {
                    statisticName: 'ratingcount',
                    value: 200,
                  },
                ],
                versions: [
                  {
                    version: '1.0.0',
                  },
                ],
              },
            ],
          },
        ],
      })
  )
  .expectJSON({
    name: 'rating',
    value: '★★★★¾',
    color: 'brightgreen',
  })

t.create('live: rating (legacy)')
  .get('/vscode-marketplace/r/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isVscodeRating,
    })
  )

t.create('live: stars (legacy)')
  .get('/vscode-marketplace/stars/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )
