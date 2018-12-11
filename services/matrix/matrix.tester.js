'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { colorScheme } = require('../test-helpers')

const t = new ServiceTester({ id: 'matrix', title: 'Matrix' })
module.exports = t

t.create('get room state as guest')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get('/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/state?access_token=TOKEN')
      .reply(
        200,
        JSON.stringify([
          {
            // valid user 1
            type: 'm.room.member',
            sender: '@user1:DUMMY.dumb',
            state_key: '@user1:DUMMY.dumb',
            content: {
              membership: 'join',
            },
          },
          {
            // valid user 2
            type: 'm.room.member',
            sender: '@user2:DUMMY.dumb',
            state_key: '@user2:DUMMY.dumb',
            content: {
              membership: 'join',
            },
          },
          {
            // should exclude banned/invited/left members
            type: 'm.room.member',
            sender: '@user3:DUMMY.dumb',
            state_key: '@user3:DUMMY.dumb',
            content: {
              membership: 'leave',
            },
          },
          {
            // exclude events like the room name
            type: 'm.room.name',
            sender: '@user4:DUMMY.dumb',
            state_key: '@user4:DUMMY.dumb',
            content: {
              membership: 'fake room',
            },
          },
        ])
      )
  )
  .expectJSON({
    name: 'chat',
    value: '2 users',
    colorB: colorScheme.brightgreen,
  })

t.create('get room state as member (backup method)')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        403,
        JSON.stringify({
          errcode: 'M_GUEST_ACCESS_FORBIDDEN', // i think this is the right one
          error: 'Guest access not allowed',
        })
      )
      .post('/_matrix/client/r0/register')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get('/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/state?access_token=TOKEN')
      .reply(
        200,
        JSON.stringify([
          {
            // valid user 1
            type: 'm.room.member',
            sender: '@user1:DUMMY.dumb',
            state_key: '@user1:DUMMY.dumb',
            content: {
              membership: 'join',
            },
          },
          {
            // valid user 2
            type: 'm.room.member',
            sender: '@user2:DUMMY.dumb',
            state_key: '@user2:DUMMY.dumb',
            content: {
              membership: 'join',
            },
          },
          {
            // should exclude banned/invited/left members
            type: 'm.room.member',
            sender: '@user3:DUMMY.dumb',
            state_key: '@user3:DUMMY.dumb',
            content: {
              membership: 'leave',
            },
          },
          {
            // exclude events like the room name
            type: 'm.room.name',
            sender: '@user4:DUMMY.dumb',
            state_key: '@user4:DUMMY.dumb',
            content: {
              membership: 'fake room',
            },
          },
        ])
      )
  )
  .expectJSON({
    name: 'chat',
    value: '2 users',
    colorB: colorScheme.brightgreen,
  })

t.create('bad server or connection')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .networkOff()
  .expectJSON({
    name: 'chat',
    value: 'inaccessible',
    colorB: colorScheme.lightgray,
  })

t.create('invalid room')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get('/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/state?access_token=TOKEN')
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
    value: 'room not world readable or is invalid',
    colorB: colorScheme.lightgray,
  })

t.create('invalid token')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get('/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/state?access_token=TOKEN')
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
    colorB: colorScheme.lightgray,
  })

t.create('unknown request')
  .get('/ROOM/DUMMY.dumb.json?style=_shields_test')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get('/_matrix/client/r0/rooms/ROOM:DUMMY.dumb/state?access_token=TOKEN')
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
    colorB: colorScheme.lightgray,
  })

t.create('test on real matrix room for API compliance')
  .get('/!ltIjvaLydYAWZyihee/matrix.org.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'chat',
      value: Joi.string().regex(/^[0-9]+ users$/),
      colorB: colorScheme.brightgreen,
    })
  )
