import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Security Rating')
  .get('/gitify-app_gitify.json?server=https://sonarcloud.io')
  .expectBadge({
    label: 'security rating',
    message: /^[A-E]$/,
  })

t.create('Security Rating (branch)')
  .get('/gitify-app_gitify/main.json?server=https://sonarcloud.io')
  .expectBadge({
    label: 'security rating',
    message: /^[A-E]$/,
  })

t.create('Security Rating (mocked)')
  .get('/gitify-app_gitify.json?server=http://sonar.shields.test')
  .intercept(nock =>
    nock('http://sonar.shields.test')
      .get('/api/measures/component')
      .query({
        componentKey: 'gitify-app_gitify',
        metricKeys: 'security_rating',
      })
      .reply(200, {
        component: {
          measures: [
            {
              metric: 'security_rating',
              value: 1,
            },
          ],
        },
      }),
  )
  .expectBadge({
    label: 'security rating',
    message: 'A',
  })

t.create('Security Rating (nonexistent component)')
  .get('/not-a-real-component-fakeness.json?server=https://sonarcloud.io')
  .expectBadge({
    label: 'security rating',
    message: 'component or metric not found, or legacy API not supported',
  })
