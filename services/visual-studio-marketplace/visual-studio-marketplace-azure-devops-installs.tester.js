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
              value: 21,
            },
            {
              statisticName: 'onpremDownloads',
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

t.create('Azure DevOps Extension total installs')
  .get('/total/swellaby.mirror-git-repository.json')
  .expectBadge({
    label: 'installs',
    message: isMetric,
  })

t.create('Azure DevOps Extension services installs')
  .get('/services/swellaby.mirror-git-repository.json')
  .expectBadge({
    label: 'installs',
    message: isMetric,
  })

t.create('invalid extension id')
  .get('/services/badges-shields.json')
  .expectBadge({
    label: 'installs',
    message: 'invalid extension id',
  })

t.create('non existent extension')
  .get('/total/badges.shields-io-fake.json')
  .expectBadge({
    label: 'installs',
    message: 'extension not found',
  })

t.create('total installs')
  .get('/total/swellaby.cobertura-transform.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectBadge({
    label: 'installs',
    message: '28',
    color: 'yellowgreen',
  })

t.create('services installs')
  .get('/services/swellaby.cobertura-transform.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectBadge({
    label: 'installs',
    message: '21',
    color: 'yellowgreen',
  })

t.create('onprem installs')
  .get('/onprem/swellaby.cobertura-transform.json')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectBadge({
    label: 'installs',
    message: '7',
    color: 'yellow',
  })

t.create('zero installs')
  .get('/total/swellaby.cobertura-transform.json')
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
