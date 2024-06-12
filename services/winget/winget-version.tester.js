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
                },
                {
                  type: 'tree',
                  name: '0.1101.416.0',
                },
                {
                  type: 'tree',
                  name: '0.1201.442.0',
                },
                {
                  type: 'tree',
                  name: '0.137.141.0',
                },
                {
                  type: 'tree',
                  name: '0.200.170.0',
                },
                {
                  type: 'tree',
                  name: '0.503.261.0',
                },
                {
                  type: 'tree',
                  name: '0.601.285.0',
                },
                {
                  type: 'tree',
                  name: '0.601.297.0',
                },
                {
                  type: 'tree',
                  name: '0.701.323.0',
                },
                {
                  type: 'tree',
                  name: '0.801.344.0',
                },
              ],
            },
          },
        },
      }),
  )
  .get('/Microsoft.DevHome.json')
  .expectBadge({ label: 'winget', message: 'v0.1201.442.0' })
