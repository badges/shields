import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

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
          releaseDate: '2019-04-13T07:50:27.000Z',
          lastUpdated: '2019-04-13T07:50:27.000Z',
        },
      ],
    },
  ],
}

t.create('installs')
  .get('/visual-studio-marketplace/i/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'installs',
    message: isMetric,
  })

t.create('downloads')
  .get('/visual-studio-marketplace/d/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('invalid extension id')
  .get('/visual-studio-marketplace/d/badges-shields.json')
  .expectBadge({
    label: 'vs marketplace',
    message: 'invalid extension id',
  })

t.create('non existent extension')
  .get('/visual-studio-marketplace/d/badges.shields-io-fake.json')
  .expectBadge({
    label: 'vs marketplace',
    message: 'extension not found',
  })

t.create('installs')
  .get('/visual-studio-marketplace/i/swellaby.rust-pack.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectBadge({
    label: 'installs',
    message: '3',
    color: 'yellow',
  })

t.create('zero installs')
  .get('/visual-studio-marketplace/i/swellaby.rust-pack.json')
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
                releaseDate: '2019-04-13T07:50:27.000Z',
                lastUpdated: '2019-04-13T07:50:27.000Z',
              },
            ],
          },
        ],
      })
  )
  .expectBadge({
    label: 'installs',
    message: '0',
    color: 'red',
  })

t.create('downloads')
  .get('/visual-studio-marketplace/d/swellaby.rust-pack.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectBadge({
    label: 'downloads',
    message: '10',
    color: 'yellowgreen',
  })

t.create('installs (legacy)')
  .get('/vscode-marketplace/i/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'installs',
    message: isMetric,
  })

t.create('downloads (legacy)')
  .get('/vscode-marketplace/d/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })
