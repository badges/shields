import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets POEditor progress online')
  .get('/progress/323337/de.json?token=7a666b44c0985d16a7b59748f488275c')
  .expectBadge({
    label: 'German',
    message: isIntegerPercentage,
  })

t.create('gets POEditor progress online')
  .get('/progress/1/zh.json?token=7a666b44c0985d16a7b59748f488275c')
  .expectBadge({
    label: 'other',
    message: "You don't have permission to access this resource",
  })

// https:/.com/docs/api#languages_list_response
const apiResponse = {
  response: {
    status: 'success',
    code: '200',
    message: 'OK',
  },
  result: {
    languages: [
      {
        name: 'English',
        code: 'en',
        translations: 13,
        percentage: 12.5,
        updated: '2015-05-04T14:21:41+0000',
      },
      {
        name: 'French',
        code: 'fr',
        translations: 70,
        percentage: 68.75,
        updated: '2015-04-30T08:59:34+0000',
      },
    ],
  },
}

t.create('gets mock POEditor progress')
  .get('/progress/1234/fr.json?token=abc123def456')
  .intercept(nock =>
    nock('https://api.poeditor.com')
      .post('/v2/languages/list', {
        id: '1234',
        api_token: 'abc123def456',
      })
      .reply(200, apiResponse)
  )
  .expectBadge({
    label: 'French',
    message: '69%',
  })

t.create('handles requests for missing languages')
  .get('/progress/1234/zh.json?token=abc123def456')
  .intercept(nock =>
    nock('https://api.poeditor.com')
      .post('/v2/languages/list', {
        id: '1234',
        api_token: 'abc123def456',
      })
      .reply(200, apiResponse)
  )
  .expectBadge({
    label: 'other',
    message: 'Language not in project',
  })

t.create('handles requests for wrong keys')
  .get('/progress/1234/fr.json?token=abc123def456')
  .intercept(nock =>
    nock('https://api.poeditor.com')
      .post('/v2/languages/list', {
        id: '1234',
        api_token: 'abc123def456',
      })
      .reply(200, {
        response: {
          status: 'fail',
          code: '403',
          message: "You don't have permission to access this resource",
        },
      })
  )
  .expectBadge({
    label: 'other',
    message: "You don't have permission to access this resource",
  })
