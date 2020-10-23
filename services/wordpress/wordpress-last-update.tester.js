'use strict'

const { ServiceTester } = require('../tester')
const { isFormattedDate } = require('../test-validators')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'WordPress Last Update',
})
module.exports = t

t.create('Plugin Last Update')
  .get('/plugin/last-updated/akismet.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('Plugin (Not Found)')
  .get('/plugin/last-updated/pleasenevermakethisplugin.json')
  .expectBadge({
    label: 'last updated',
    message: 'not found',
  })

t.create('Theme Last Update')
  .get('/theme/last-updated/twentytwenty.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('Theme (Not Found)')
  .get('/theme/last-updated/pleasenevermakethistheme.json')
  .expectBadge({
    label: 'last updated',
    message: 'not found',
  })
