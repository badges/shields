'use strict'

const { isFormattedDate } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('last commit (recent)')
  .get('/eslint/eslint.json')
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
    link: [
      `https://github.com/eslint`,
      `https://github.com/eslint/commits/master`,
    ],
  })

t.create('last commit (ancient)')
  .get('/badges/badgr.co.json')
  .expectBadge({
    label: 'last commit',
    message: 'january 2014',
    link: [
      `https://github.com/badges/badgr.co`,
      `https://github.com/badges/badgr.co/commits/master`,
    ],
  })

t.create('last commit (on branch)')
  .get('/badges/badgr.co/shielded.json')
  .expectBadge({
    label: 'last commit',
    message: 'july 2013',
    link: [
      `https://github.com/badges/badgr.co`,
      `https://github.com/badges/badgr.co/commits/shielded`,
    ],
  })

t.create('last commit (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({ label: 'last commit', message: 'repo not found' })
