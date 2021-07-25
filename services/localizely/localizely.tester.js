import { createServiceTester } from '../tester.js'
import { isIntegerPercentage } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Overall progress')
  .get(
    '/5cc34208-0418-40b1-8353-acc70c95f802.json?token=0f4d5e31a44f48dcbab966c52cfb0a67c5f1982186c14b85ab389a031dbc225a'
  )
  .expectBadge({ label: 'localized', message: isIntegerPercentage })

t.create('Overall progress on specific branch')
  .get(
    '/5cc34208-0418-40b1-8353-acc70c95f802/Version_1.0.json?token=0f4d5e31a44f48dcbab966c52cfb0a67c5f1982186c14b85ab389a031dbc225a'
  )
  .expectBadge({ label: 'localized', message: isIntegerPercentage })

t.create('Overall progress with invalid token')
  .get(
    '/1349592f-8d05-4317-9f46-bddc5def11fe/main.json?token=312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715'
  )
  .intercept(nock =>
    nock('https://api.localizely.com', {
      reqheaders: {
        'x-api-token':
          '312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715',
      },
    })
      .get('/v1/projects/1349592f-8d05-4317-9f46-bddc5def11fe/status')
      .query({ branch: 'main' })
      .reply(403, {
        errorCode: 'forbidden',
        errorMessage: 'Tried to access unauthorized project',
      })
  )
  .expectBadge({ label: 'localized', message: 'not authorized for project' })

t.create('Language progress')
  .get(
    '/5cc34208-0418-40b1-8353-acc70c95f802.json?languageCode=en-US&token=0f4d5e31a44f48dcbab966c52cfb0a67c5f1982186c14b85ab389a031dbc225a'
  )
  .expectBadge({ label: 'English (US)', message: isIntegerPercentage })

t.create('Language progress on specific branch')
  .get(
    '/5cc34208-0418-40b1-8353-acc70c95f802/Version_1.0.json?languageCode=en-US&token=0f4d5e31a44f48dcbab966c52cfb0a67c5f1982186c14b85ab389a031dbc225a'
  )
  .expectBadge({ label: 'English (US)', message: isIntegerPercentage })

t.create('Language progress with invalid token')
  .get(
    '/1349592f-8d05-4317-9f46-bddc5def11fe/main.json?languageCode=en-US&token=312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715'
  )
  .intercept(nock =>
    nock('https://api.localizely.com', {
      reqheaders: {
        'x-api-token':
          '312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715',
      },
    })
      .get('/v1/projects/1349592f-8d05-4317-9f46-bddc5def11fe/status')
      .query({ branch: 'main' })
      .reply(403, {
        errorCode: 'forbidden',
        errorMessage: 'Tried to access unauthorized project',
      })
  )
  .expectBadge({ label: 'localized', message: 'not authorized for project' })

t.create('Language progress for unsupported language code')
  .get(
    '/1349592f-8d05-4317-9f46-bddc5def11fe/main.json?languageCode=fr&token=312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715'
  )
  .intercept(nock =>
    nock('https://api.localizely.com', {
      reqheaders: {
        'x-api-token':
          '312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715',
      },
    })
      .get('/v1/projects/1349592f-8d05-4317-9f46-bddc5def11fe/status')
      .query({ branch: 'main' })
      .reply(200, {
        strings: 100,
        reviewedProgress: 85,
        languages: [
          {
            langCode: 'zh-Hans-CN',
            langName: 'Chinese Simplified (CN)',
            strings: 100,
            reviewed: 85,
            reviewedProgress: 85,
          },
        ],
      })
  )
  .expectBadge({ label: 'localized', message: 'Unsupported language' })

t.create('Language progress for supported language code')
  .get(
    '/1349592f-8d05-4317-9f46-bddc5def11fe/main.json?languageCode=en-US&token=312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715'
  )
  .intercept(nock =>
    nock('https://api.localizely.com', {
      reqheaders: {
        'x-api-token':
          '312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715',
      },
    })
      .get('/v1/projects/1349592f-8d05-4317-9f46-bddc5def11fe/status')
      .query({ branch: 'main' })
      .reply(200, {
        strings: 5,
        reviewedProgress: 60,
        languages: [
          {
            langCode: 'en-US',
            langName: 'English (US)',
            strings: 5,
            reviewed: 3,
            reviewedProgress: 60,
          },
          {
            langCode: 'de',
            langName: 'German',
            strings: 5,
            reviewed: 3,
            reviewedProgress: 60,
          },
        ],
      })
  )
  .expectBadge({ label: 'English (US)', message: '60%' })
