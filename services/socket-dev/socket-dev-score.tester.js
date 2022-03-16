import { createServiceTester } from '../tester.js'
import { isPercentage } from '../test-validators.js'
export const t = await createServiceTester()

t.create('should show final score')
  .get('/supplyChainRisk-score/npm/vue.json')
  .expectBadge({
    label: 'socket score',
    message: isPercentage,
  })

t.create('should show color')
  .get('/supplyChainRisk-score/npm/mock-for-package-score.json')
  .intercept(nock => {
    nock.enableNetConnect()

    return nock('https://socket.dev', { allowUnmocked: true })
      .get('/api/npm/package-info/score?name=mock-for-package-score')
      .reply(200, {
        score: {
          supplyChainRisk: {
            score: 0.89,
          },
        },
      })
  })
  .expectBadge({
    label: 'socket score',
    message: isPercentage,
    color: 'yellowgreen',
  })

t.create('should show final score with scope')
  .get('/supplyChainRisk-score/npm/@vue/cli.json')
  .expectBadge({
    label: 'socket score',
    message: isPercentage,
  })

t.create('should show quality').get('/quality-score/npm/vue.json').expectBadge({
  label: 'socket score (quality)',
  message: isPercentage,
})

t.create('should show maintenance')
  .get('/maintenance-score/npm/vue.json')
  .expectBadge({
    label: 'socket score (maintenance)',
    message: isPercentage,
  })

t.create('should show vulnerability')
  .get('/vulnerability-score/npm/vue.json')
  .expectBadge({
    label: 'socket score (vulnerability)',
    message: isPercentage,
  })

t.create('should show license').get('/license-score/npm/vue.json').expectBadge({
  label: 'socket score (license)',
  message: isPercentage,
})

t.create('unknown package')
  .get('/supplyChainRisk-score/npm/npm-api-does-not-have-this-package.json')
  .expectBadge({
    label: 'socket score',
    message: 'package not found or too new',
  })
