'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'matrix', title: 'Matrix' })
module.exports = t

t.create('get member status')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
  )
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .get(
        '/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/members?access_token=TOKEN'
      )
      .reply(
        200,
        JSON.stringify({
          chunk: [
            {
              // valid user 1
              sender: '@user1:DUMMY.dumb',
              state_key: '@user1:DUMMY.dumb',
              content: {
                membership: 'join',
              },
            },
            {
              // valid user 2
              sender: '@user2:DUMMY.dumb',
              state_key: '@user2:DUMMY.dumb',
              content: {
                membership: 'join',
              },
            },
            {
              // should exclude banned/invited/left members
              sender: '@user3:DUMMY.dumb',
              state_key: '@user3:DUMMY.dumb',
              content: {
                membership: 'ban',
              },
            },
            {
              // exclude events like banning and invites
              sender: '@user4:DUMMY.dumb',
              state_key: '@user4_actor:DUMMY.dumb',
              content: {
                membership: 'join',
              },
            },
          ],
        })
      )
  )
  .expectJSON({
    name: 'chat',
    value: '2 users',
    colorB: '#4c1',
  })

t.create('bad server or connection')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .networkOff()
  .expectJSON({
    name: 'chat',
    value: 'inaccessible',
    colorB: '#9f9f9f',
  })

t.create('invalid room')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
  )
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .get(
        '/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/members?access_token=TOKEN'
      )
      .reply(
        403,
        JSON.stringify({
          errcode: 'M_GUEST_ACCESS_FORBIDDEN',
          error: 'Guest access not allowed',
        })
      )
  )
  .expectJSON({
    name: 'chat',
    value: 'invalid or private room',
    colorB: '#9f9f9f',
  })

t.create('invalid token')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
  )
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .get(
        '/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/members?access_token=TOKEN'
      )
      .reply(
        401,
        JSON.stringify({
          errcode: 'M_UNKNOWN_TOKEN',
          error: 'Unrecognised access token.',
        })
      )
  )
  .expectJSON({
    name: 'chat',
    value: 'bad auth token',
    colorB: '#9f9f9f',
  })

t.create('unknown request')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
  )
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .get(
        '/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/members?access_token=TOKEN'
      )
      .reply(
        400,
        JSON.stringify({
          errcode: 'M_UNRECOGNIZED',
          error: 'Unrecognized request',
        })
      )
  )
  .expectJSON({
    name: 'chat',
    value: 'unknown request',
    colorB: '#9f9f9f',
  })
