import { isVPlusDottedVersionNClauses } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

// basic test
t.create('gets the package version of WSL')
  .get('/Microsoft.WSL.json')
  .expectBadge({ label: 'winget', message: isVPlusDottedVersionNClauses })

// test more than one dots
t.create('gets the package version of .NET 8')
  .get('/Microsoft.DotNet.SDK.8.json')
  .expectBadge({ label: 'winget', message: isVPlusDottedVersionNClauses })

// test sort based on dotted version order instead of ASCII
t.create('gets the latest version')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            object: {
              entries: [
                {
                  type: 'tree',
                  name: '0.1001.389.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.1101.416.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.1201.442.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.137.141.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.200.170.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.503.261.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.601.285.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.601.297.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.701.323.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '0.801.344.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Microsoft.DevHome.yaml',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      }),
  )
  .get('/Microsoft.DevHome.json')
  .expectBadge({ label: 'winget', message: 'v0.1201.442.0' })

// Both 'Some.Package' and 'Some.Package.Sub' are present in the response.
// We should ignore 'Some.Package.Sub' in response to 'Some.Package' request.
// In this test case, Canonical.Ubuntu.2404 is present, but it should not be treated as Canonical.Ubuntu version 2404.
t.create('do not pick sub-package as version')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            object: {
              entries: [
                {
                  type: 'blob',
                  name: '.validation',
                  object: {},
                },
                {
                  type: 'tree',
                  name: '1804',
                  object: {
                    entries: [
                      {
                        type: 'tree',
                        name: '1804.6.4.0',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '2004',
                  object: {
                    entries: [
                      {
                        type: 'tree',
                        name: '2004.6.16.0',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '2204.1.8.0',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: 'Canonical.Ubuntu.installer.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Canonical.Ubuntu.locale.en-US.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Canonical.Ubuntu.locale.zh-CN.yaml',
                      },
                      {
                        type: 'blob',
                        name: 'Canonical.Ubuntu.yaml',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '2204',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: '.validation',
                      },
                      {
                        type: 'tree',
                        name: '2204.0.10.0',
                      },
                      {
                        type: 'tree',
                        name: '2204.2.47.0',
                      },
                    ],
                  },
                },
                {
                  type: 'tree',
                  name: '2404',
                  object: {
                    entries: [
                      {
                        type: 'blob',
                        name: '.validation',
                      },
                      {
                        type: 'tree',
                        name: '2404.0.5.0',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      }),
  )
  .get('/Canonical.Ubuntu.json')
  .expectBadge({ label: 'winget', message: 'v2204.1.8.0' })
