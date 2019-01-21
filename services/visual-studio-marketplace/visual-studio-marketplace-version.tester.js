'use strict'

const Joi = require('joi')
const t = (module.exports = require('../create-service-tester')())
const { withRegex } = require('../test-validators')

const isMarketplaceVersion = withRegex(/^v(\d+\.\d+\.\d+)(\.\d+)?$/)

t.create('live: rating')
  .get('/visual-studio-marketplace/v/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'version',
      value: isMarketplaceVersion,
    })
  )

t.create('version')
  .get(
    '/visual-studio-marketplace/v/ritwickdey.LiveServer.json?style=_shields_test'
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
    name: 'version',
    value: 'v1.0.0',
    color: 'blue',
  })

t.create('pre-release version')
  .get(
    '/visual-studio-marketplace/v/swellaby.vscode-rust-test-adapter.json?style=_shields_test'
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
                    version: '0.3.8',
                  },
                ],
              },
            ],
          },
        ],
      })
  )
  .expectJSON({
    name: 'version',
    value: 'v0.3.8',
    color: 'orange',
  })

t.create('live: version (legacy)')
  .get('/vscode-marketplace/v/ritwickdey.LiveServer.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'version',
      value: isMarketplaceVersion,
    })
  )
