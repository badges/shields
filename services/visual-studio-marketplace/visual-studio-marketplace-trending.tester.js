'use strict'

const { withRegex } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('trending daily')
  .get(
    '/visual-studio-marketplace/trending/daily/yasht.terminal-all-in-one.json'
  )
  .expectBadge({
    label: 'trending daily',
    message: withRegex(/^[0-9]{1,3}\.[0-9]{2}$/),
  })

t.create('trending weekly')
  .get(
    '/visual-studio-marketplace/trending/weekly/yasht.terminal-all-in-one.json'
  )
  .expectBadge({
    label: 'trending weekly',
    message: withRegex(/^[0-9]{1,3}\.[0-9]{2}$/),
  })

t.create('trending monthly')
  .get(
    '/visual-studio-marketplace/trending/monthly/yasht.terminal-all-in-one.json'
  )
  .expectBadge({
    label: 'trending monthly',
    message: withRegex(/^[0-9]{1,3}\.[0-9]{2}$/),
  })

t.create('invalid extension id')
  .get(
    '/visual-studio-marketplace/trending/weekly/yasht-terminal-all-in-one.json'
  )
  .expectBadge({
    label: 'vs marketplace',
    message: 'invalid extension id',
  })

t.create('non existent extension')
  .get(
    '/visual-studio-marketplace/trending/monthly/yasht.terminal-all-in-one-fake.json'
  )
  .expectBadge({
    label: 'vs marketplace',
    message: 'extension not found',
  })
