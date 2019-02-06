'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('NodePing status - up (live)')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .expectJSON({
    name: 'Status',
    value: 'up',
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
  .expectJSON({
    name: 'Status',
    value: 'up',
  })

t.create('NodePing status - down (live)')
  .get('/wf47q49c-zdmk-4ngx-88g4-wa7mzgluhhaf.json')
  .expectJSON({
    name: 'Status',
    value: 'down',
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
  .expectJSON({
    name: 'Status',
    value: 'down',
  })

t.create('NodePing status - custom up color/message')
  .get(
    '/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json?style=_shields_test&up_color=blue&up_message=happy'
  )
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        '/reports/results/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei/1?format=json'
      )
      .reply(200, [{ su: true }])
  )
  .expectJSON({
    name: 'Status',
    value: 'happy',
    color: 'blue',
  })

t.create('NodePing status - custom down color/message')
  .get(
    '/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json?style=_shields_test&down_color=yellow&down_message=sad'
  )
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        '/reports/results/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei/1?format=json'
      )
      .reply(200, [{ su: false }])
  )
  .expectJSON({
    name: 'Status',
    value: 'sad',
    color: 'yellow',
  })
