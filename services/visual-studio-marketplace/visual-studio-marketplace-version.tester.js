'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')

const isMarketplaceVersion = withRegex(/^v(\d+\.\d+\.\d+)(\.\d+)?$/)

t.create('rating')
  .get('/visual-studio-marketplace/v/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'version',
    message: isMarketplaceVersion,
  })

t.create('version')
  .get('/visual-studio-marketplace/v/ritwickdey.LiveServer.json')
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
  .expectBadge({
    label: 'version',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('pre-release version')
  .get('/visual-studio-marketplace/v/swellaby.vscode-rust-test-adapter.json')
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
  .expectBadge({
    label: 'version',
    message: 'v0.3.8',
    color: 'orange',
  })

t.create('version (legacy)')
  .get('/vscode-marketplace/v/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'version',
    message: isMarketplaceVersion,
  })
