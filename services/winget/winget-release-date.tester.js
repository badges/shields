import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

// basic live test - hits real winget API
t.create('release date for WSL')
  .get('/release-date/Microsoft.WSL.json')
  .expectBadge({ label: 'release date', message: isFormattedDate })

// test more than one dots
// test sort based on dotted version order instead of ASCII
t.create('gets release date for latest version')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql')
      .twice()
      .reply((uri, requestBody) => {
        const { query, variables } = JSON.parse(requestBody)

        if (query.includes('Tree')) {
          return [
            200,
            {
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
            },
          ]
        }

        if (variables.expression.includes('0.1201.442.0')) {
          return [
            200,
            {
              data: {
                repository: {
                  object: {
                    text: 'PackageIdentifier: Microsoft.DevHome\nReleaseDate: 2024-03-15\n',
                  },
                },
              },
            },
          ]
        }

        return [200, { data: { repository: { object: null } } }]
      }),
  )
  .get('/release-date/Microsoft.DevHome.json')
  .expectBadge({ label: 'release date', message: isFormattedDate })

// Both 'Some.Package' and 'Some.Package.Sub' are present in the response.
// We should ignore 'Some.Package.Sub' in response to 'Some.Package' request.
// In this test case, Canonical.Ubuntu.2404 is present, but it should not be treated as Canonical.Ubuntu version 2404.
t.create('do not pick sub-package release date')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql')
      .twice()
      .reply((uri, requestBody) => {
        const { query, variables } = JSON.parse(requestBody)

        if (query.includes('Tree')) {
          return [
            200,
            {
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
            },
          ]
        }

        if (variables.expression.includes('2204.1.8.0')) {
          return [
            200,
            {
              data: {
                repository: {
                  object: {
                    text: 'PackageIdentifier: Canonical.Ubuntu\nReleaseDate: 2024-03-15\n',
                  },
                },
              },
            },
          ]
        }
        return [200, { data: { repository: { object: null } } }]
      }),
  )
  .get('/release-date/Canonical.Ubuntu.json')
  .expectBadge({ label: 'release date', message: isFormattedDate })
