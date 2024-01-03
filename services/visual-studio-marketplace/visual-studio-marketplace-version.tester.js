import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'
export const t = await createServiceTester()

const isMarketplaceVersion = withRegex(/^v(\d+\.\d+\.\d+)(\.\d+)?$/)

t.create('rating')
  .get('/visual-studio-marketplace/v/lextudio.restructuredtext.json')
  .expectBadge({
    label: 'version',
    message: isMarketplaceVersion,
  })

t.create('version')
  .get('/visual-studio-marketplace/v/lextudio.restructuredtext.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post('/extensionquery/')
      .reply(200, {
        results: [
          {
            extensions: [
              {
                statistics: [],
                versions: [
                  {
                    version: '1.3.8-alpha',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                      {
                        key: 'Microsoft.VisualStudio.Code.PreRelease',
                        value: 'true',
                      },
                    ],
                  },
                  {
                    version: '1.0.0',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                    ],
                  },
                ],
                releaseDate: '2019-04-13T07:50:27.000Z',
                lastUpdated: '2019-04-13T07:50:27.000Z',
              },
            ],
          },
        ],
      }),
  )
  .expectBadge({
    label: 'version',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create(
  'version - includePrereleases flag is false and response has pre-release only',
)
  .get('/visual-studio-marketplace/v/lextudio.restructuredtext.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post('/extensionquery/')
      .reply(200, {
        results: [
          {
            extensions: [
              {
                statistics: [],
                versions: [
                  {
                    version: '1.3.8',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                      {
                        key: 'Microsoft.VisualStudio.Code.PreRelease',
                        value: 'true',
                      },
                    ],
                  },
                  {
                    version: '1.3.7',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                      {
                        key: 'Microsoft.VisualStudio.Code.PreRelease',
                        value: 'true',
                      },
                    ],
                  },
                  {
                    version: '1.3.6',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                      {
                        key: 'Microsoft.VisualStudio.Code.PreRelease',
                        value: 'true',
                      },
                    ],
                  },
                ],
                releaseDate: '2019-04-13T07:50:27.000Z',
                lastUpdated: '2019-04-13T07:50:27.000Z',
              },
            ],
          },
        ],
      }),
  )
  .expectBadge({
    label: 'version',
    message: 'v1.3.8',
    color: 'blue',
  })

t.create('version - prerelease key has false value')
  .get('/visual-studio-marketplace/v/lextudio.restructuredtext.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post('/extensionquery/')
      .reply(200, {
        results: [
          {
            extensions: [
              {
                statistics: [],
                versions: [
                  {
                    version: '1.3.8',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                      {
                        key: 'Microsoft.VisualStudio.Code.PreRelease',
                        value: 'true',
                      },
                    ],
                  },
                  {
                    version: '1.3.7',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                      {
                        key: 'Microsoft.VisualStudio.Code.PreRelease',
                        value: 'true',
                      },
                    ],
                  },
                  {
                    version: '1.3.6',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                      {
                        key: 'Microsoft.VisualStudio.Code.PreRelease',
                        value: 'false',
                      },
                    ],
                  },
                ],
                releaseDate: '2019-04-13T07:50:27.000Z',
                lastUpdated: '2019-04-13T07:50:27.000Z',
              },
            ],
          },
        ],
      }),
  )
  .expectBadge({
    label: 'version',
    message: 'v1.3.6',
    color: 'blue',
  })

t.create('pre-release version')
  .get(
    '/visual-studio-marketplace/v/swellaby.vscode-rust-test-adapter.json?include_prereleases',
  )
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post('/extensionquery/')
      .reply(200, {
        results: [
          {
            extensions: [
              {
                statistics: [],
                versions: [
                  {
                    version: '1.3.8-alpha',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                      {
                        key: 'Microsoft.VisualStudio.Code.PreRelease',
                        value: 'true',
                      },
                    ],
                  },
                  {
                    version: '1.0.0',
                    properties: [
                      {
                        key: 'Microsoft.VisualStudio.Services.Branding.Theme',
                        value: 'light',
                      },
                    ],
                  },
                ],
                releaseDate: '2019-04-13T07:50:27.000Z',
                lastUpdated: '2019-04-13T07:50:27.000Z',
              },
            ],
          },
        ],
      }),
  )
  .expectBadge({
    label: 'version',
    message: 'v1.3.8-alpha',
    color: 'orange',
  })

t.create('version (legacy)')
  .get('/vscode-marketplace/v/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'version',
    message: isMarketplaceVersion,
  })
