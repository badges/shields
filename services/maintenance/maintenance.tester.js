'use strict'

const t = (module.exports = require('../tester').createServiceTester())

const currentYear = new Date().getUTCFullYear()

t.create('yes last maintained 2016 (no)')
  .get('/yes/2016.json')
  .expectBadge({ label: 'maintained', message: 'no! (as of 2016)' })

t.create('no longer maintained 2017 (no)')
  .get('/no/2017.json')
  .expectBadge({ label: 'maintained', message: 'no! (as of 2017)' })

t.create('yes this year (yes)')
  .get(`/yes/${currentYear}.json`)
  .expectBadge({ label: 'maintained', message: 'yes' })

t.create(`until end of ${currentYear} (yes)`)
  .get(`/until end of ${currentYear}/${currentYear}.json`)
  .expectBadge({ label: 'maintained', message: `until end of ${currentYear}` })

t.create(`stale last maintained ${currentYear - 1} (yes)`)
  .get(`/yes/${currentYear - 1}.json`)
  .expectBadge({ label: 'maintained', message: `stale (as of ${currentYear})` })
