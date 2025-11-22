import { createServiceTester } from '../tester.js'

const getURL = '/3.0.json?specUrl=https://example.com/example.json'
const getURLBase = '/3.0.json?specUrl='
const apiURL = 'https://validator.swagger.io'
const apiGetURL = '/validator/debug'
const apiGetQueryParams = {
  url: 'https://example.com/example.json',
}
export const t = await createServiceTester()

t.create('Invalid')
  .get(getURL)
  .intercept(nock =>
    nock(apiURL)
      .get(apiGetURL)
      .query(apiGetQueryParams)
      .reply(200, {
        schemaValidationMessages: [
          {
            level: 'error',
            message: 'error',
          },
        ],
      }),
  )
  .expectBadge({
    label: 'swagger',
    message: 'invalid',
    color: 'red',
  })

t.create('Valid json 2.0')
  .get(
    `${getURLBase}https://raw.githubusercontent.com/OAI/OpenAPI-Specification/c442afe06ec28443df0c69d01dc38c54968b246f/examples/v2.0/json/petstore-expanded.json`,
  )
  .expectBadge({
    label: 'swagger',
    message: 'valid',
    color: 'brightgreen',
  })

t.create('Valid yaml 3.0')
  .get(
    `${getURLBase}https://raw.githubusercontent.com/OAI/OpenAPI-Specification/c442afe06ec28443df0c69d01dc38c54968b246f/examples/v3.0/petstore.yaml`,
  )
  .expectBadge({
    label: 'swagger',
    message: 'valid',
    color: 'brightgreen',
  })

t.create('Valid with warnings')
  .get(`${getURLBase}https://petstore3.swagger.io/api/v3/openapi.json`)
  .expectBadge({
    label: 'swagger',
    message: 'valid',
    color: 'brightgreen',
  })

// Isn't a spec, but valid json
t.create('Invalid')
  .get(
    `${getURLBase}https://raw.githubusercontent.com/OAI/OpenAPI-Specification/c442afe06ec28443df0c69d01dc38c54968b246f/schemas/v3.0/schema.json`,
  )
  .expectBadge({
    label: 'swagger',
    message: 'invalid',
    color: 'red',
  })

t.create('Not found')
  .get(
    `${getURLBase}https://raw.githubusercontent.com/OAI/OpenAPI-Specification/c442afe06ec28443df0c69d01dc38c54968b246f/examples/v3.0/notFound.yaml`,
  )
  .expectBadge({
    label: 'swagger',
    message: 'spec not found or unreadable',
    color: 'red',
  })
