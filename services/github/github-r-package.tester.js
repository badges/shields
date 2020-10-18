'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('R package version').get('/mixOmicsTeam/mixOmics.json').expectBadge({
  label: 'R',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('R package version (from branch)')
  .get('/mixOmicsTeam/mixOmics/master.json')
  .expectBadge({
    label: 'R@master',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('R package version (monorepo)')
  .get(
    `/wch/r-source.json?filename=${encodeURIComponent(
      'src/gnuwin32/windlgs/DESCRIPTION'
    )}`
  )
  .expectBadge({
    label: 'R',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('R package version (repo not found)')
  .get('/badges/not-existing-repo.json')
  .expectBadge({
    label: 'R',
    message: 'repo not found, branch not found, or DESCRIPTION missing',
  })
