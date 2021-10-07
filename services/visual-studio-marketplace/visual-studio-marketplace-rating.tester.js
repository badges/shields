import { createServiceTester } from '../tester.js'
import { withRegex, isStarRating } from '../test-validators.js'
export const t = await createServiceTester()

const isVscodeRating = withRegex(/[0-5]\.[0-9]{1}\/5?\s*\([0-9]*\)$/)

t.create('rating')
  .get('/visual-studio-marketplace/r/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'rating',
    message: isVscodeRating,
  })

t.create('stars')
  .get('/visual-studio-marketplace/stars/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
  })

t.create('rating')
  .get('/visual-studio-marketplace/r/ritwickdey.LiveServer.json')
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
                releaseDate: '2019-04-13T07:50:27.000Z',
                lastUpdated: '2019-04-13T07:50:27.000Z',
              },
            ],
          },
        ],
      })
  )
  .expectBadge({
    label: 'rating',
    message: '2.5/5 (10)',
    color: 'yellowgreen',
  })

t.create('zero rating')
  .get('/visual-studio-marketplace/r/ritwickdey.LiveServer.json')
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
    label: 'rating',
    message: 'no ratings',
    color: 'lightgrey',
  })

t.create('stars')
  .get('/visual-studio-marketplace/stars/ritwickdey.LiveServer.json')
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
                releaseDate: '2019-04-13T07:50:27.000Z',
                lastUpdated: '2019-04-13T07:50:27.000Z',
              },
            ],
          },
        ],
      })
  )
  .expectBadge({
    label: 'rating',
    message: '★★★★¾',
    color: 'brightgreen',
  })

t.create('rating (legacy)')
  .get('/vscode-marketplace/r/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'rating',
    message: isVscodeRating,
  })

t.create('stars (legacy)')
  .get('/vscode-marketplace/stars/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
  })
