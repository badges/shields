'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('NodePing status - live')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .expectBadge({
    label: 'Status',
    message: Joi.equal('up', 'down').required(),
  })

t.create('NodePing status - up (mock)')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        '/reports/results/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei/1?format=json'
      )
      .reply(200, [{ su: true }])
  )
  .expectBadge({
    label: 'Status',
    message: 'up',
  })

t.create('NodePing status - down (mock)')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        '/reports/results/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei/1?format=json'
      )
      .reply(200, [{ su: false }])
  )
  .expectBadge({
    label: 'Status',
    message: 'down',
  })
