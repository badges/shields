'use strict'

const { isPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('should show final score').get('/final/vue.json').expectBadge({
  label: 'score',
  message: isPercentage,
})

t.create('should show color')
  .get('/final/mock-for-package-score.json')
  .intercept(nock => {
    nock.enableNetConnect()

    return nock('https://api.npms.io', { allowUnmocked: true })
      .get(`/v2/package/mock-for-package-score`)
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
  .get('/final/@vue/cli.json')
  .expectBadge({
    label: 'score',
    message: isPercentage,
  })

t.create('should show maintenance').get('/maintenance/vue.json').expectBadge({
  label: 'maintenance',
  message: isPercentage,
})

t.create('should show popularity').get('/popularity/vue.json').expectBadge({
  label: 'popularity',
  message: isPercentage,
})

t.create('should show quality').get('/quality/vue.json').expectBadge({
  label: 'quality',
  message: isPercentage,
})

t.create('unknown package')
  .get('/final/npm-api-does-not-have-this-package.json')
  .expectBadge({
    label: 'score',
    message: 'package not found or too new',
    color: 'red',
  })
