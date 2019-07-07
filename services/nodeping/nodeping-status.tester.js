'use strict'

const Joi = require('@hapi/joi')
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

t.create('NodePing status - custom up color/message')
  .get(
    '/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json?up_color=blue&up_message=happy'
  )
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        '/reports/results/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei/1?format=json'
      )
      .reply(200, [{ su: true }])
  )
  .expectBadge({
    label: 'Status',
    message: 'happy',
    color: 'blue',
  })

t.create('NodePing status - custom down color/message')
  .get(
    '/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json?down_color=yellow&down_message=sad'
  )
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        '/reports/results/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei/1?format=json'
      )
      .reply(200, [{ su: false }])
  )
  .expectBadge({
    label: 'Status',
    message: 'sad',
    color: 'yellow',
  })
