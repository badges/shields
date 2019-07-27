'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

// This test will extract the currency value from the
// string value response from the server.
// \b  = Asset position at word boundary
// \d+ = match a digit [0-9]
// credit for this regex goes to:
// https://stackoverflow.com/questions/38074000/how-to-get-float-value-from-string-using-regex

t.create('Codetally')
  .get('/triggerman722/colorstrap.json')
  .timeout(10000)
  .expectBadge({
    label: 'codetally',
    message: Joi.string().regex(/\b\d+(?:.\d+)?/),
  })

t.create('Empty')
  .get('/triggerman722/colorstrap.json')
  .intercept(nock =>
    nock('http://www.codetally.com')
      .get('/formattedshield/triggerman722/colorstrap')
      .reply(200, {
        currency_sign: '$',
        amount: '0.00',
        multiplier: '',
        currency_abbreviation: 'CAD',
      })
  )
  .expectBadge({ label: 'codetally', message: '$0.00' })

t.create('Non existent')
  .get('/not/real.json')
  .timeout(10000)
  .expectBadge({ label: 'codetally', message: 'repo not found' })
