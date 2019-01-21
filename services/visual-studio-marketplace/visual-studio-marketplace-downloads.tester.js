'use strict'

const Joi = require('joi')
const t = (module.exports = require('../create-service-tester')())
const { isMetric } = require('../test-validators')

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
        },
      ],
    },
  ],
}

t.create('live: installs')
  .get('/visual-studio-marketplace/i/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs',
      value: isMetric,
    })
  )

t.create('live: downloads')
  .get('/visual-studio-marketplace/d/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('live: invalid extension id')
  .get('/visual-studio-marketplace/d/badges-shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'vs marketplace',
      value: 'invalid extension id',
    })
  )

t.create('live: non existent extension')
  .get('/visual-studio-marketplace/d/badges.shields-io-fake.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'vs marketplace',
      value: 'extension not found',
    })
  )

t.create('installs')
  .get(
    '/visual-studio-marketplace/i/swellaby.rust-pack.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectJSON({
    name: 'installs',
    value: '3',
    color: 'yellow',
  })

t.create('zero installs')
  .get(
    '/visual-studio-marketplace/i/swellaby.rust-pack.json?style=_shields_test'
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
    name: 'installs',
    value: '0',
    color: 'red',
  })

t.create('downloads')
  .get(
    '/visual-studio-marketplace/d/swellaby.rust-pack.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectJSON({
    name: 'downloads',
    value: '10',
    color: 'yellowgreen',
  })

t.create('live: installs (legacy)')
  .get('/vscode-marketplace/i/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs',
      value: isMetric,
    })
  )

t.create('live: downloads (legacy)')
  .get('/vscode-marketplace/d/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )
