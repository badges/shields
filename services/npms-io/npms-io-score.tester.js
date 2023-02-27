import { createServiceTester } from '../tester.js'
import { isPercentage } from '../test-validators.js'
export const t = await createServiceTester()

t.create('should show final score').get('/score/final/vue.json').expectBadge({
  label: 'score',
  message: isPercentage,
})

t.create('should show color')
  .get('/score/final/mock-for-package-score.json')
  .intercept(nock => {
    nock.enableNetConnect()

    return nock('https://api.npms.io', { allowUnmocked: true })
      .get('/v2/package/mock-for-package-score')
      .reply(200, {
        score: {
          final: 0.89,
        },
      })
  })
  .expectBadge({
    label: 'score',
    message: isPercentage,
    color: 'yellowgreen',
  })

t.create('should show final score with scope')
  .get('/score/final/@vue/cli.json')
  .expectBadge({
    label: 'score',
    message: isPercentage,
  })

t.create('should show maintenance')
  .get('/score/maintenance/vue.json')
  .expectBadge({
    label: 'maintenance',
    message: isPercentage,
  })

t.create('should show popularity')
  .get('/score/popularity/vue.json')
  .expectBadge({
    label: 'popularity',
    message: isPercentage,
  })

t.create('should show quality').get('/score/quality/vue.json').expectBadge({
  label: 'quality',
  message: isPercentage,
})

t.create('unknown package')
  .get('/score/final/npm-api-does-not-have-this-package.json')
  .expectBadge({
    label: 'score',
    message: 'package not found or too new',
    color: 'red',
  })

t.create('Redirect with scope')
  .get('/final-score/@cycle/core')
  .expectRedirect('/npms-io/score/final/@cycle/core.svg')

t.create('Redirect without scope')
  .get('/final-score/got')
  .expectRedirect('/npms-io/score/final/got.svg')
