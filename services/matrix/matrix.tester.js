import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('get room state as guest')
  .get('/ALIAS:DUMMY.dumb.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get(
        '/_matrix/client/r0/directory/room/%23ALIAS%3ADUMMY.dumb?access_token=TOKEN'
      )
      .reply(
        200,
        JSON.stringify({
          room_id: 'ROOM:DUMMY.dumb',
        })
      )
      .get(
        '/_matrix/client/r0/rooms/ROOM%3ADUMMY.dumb/state?access_token=TOKEN'
      )
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
  .expectBadge({
    label: 'chat',
    message: '2 users',
    color: 'brightgreen',
  })

t.create('get room state as member (backup method)')
  .get('/ALIAS:DUMMY.dumb.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        403,
        JSON.stringify({
          errcode: 'M_GUEST_ACCESS_FORBIDDEN',
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
      .get(
        '/_matrix/client/r0/directory/room/%23ALIAS%3ADUMMY.dumb?access_token=TOKEN'
      )
      .reply(
        200,
        JSON.stringify({
          room_id: 'ROOM:DUMMY.dumb',
        })
      )
      .get(
        '/_matrix/client/r0/rooms/ROOM%3ADUMMY.dumb/state?access_token=TOKEN'
      )
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
  .expectBadge({
    label: 'chat',
    message: '2 users',
    color: 'brightgreen',
  })

t.create('bad server or connection')
  .get('/ALIAS:DUMMY.dumb.json')
  .networkOff()
  .expectBadge({
    label: 'chat',
    message: 'inaccessible',
    color: 'lightgrey',
  })

t.create('non-world readable room')
  .get('/ALIAS:DUMMY.dumb.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get(
        '/_matrix/client/r0/directory/room/%23ALIAS%3ADUMMY.dumb?access_token=TOKEN'
      )
      .reply(
        200,
        JSON.stringify({
          room_id: 'ROOM:DUMMY.dumb',
        })
      )
      .get(
        '/_matrix/client/r0/rooms/ROOM%3ADUMMY.dumb/state?access_token=TOKEN'
      )
      .reply(
        403,
        JSON.stringify({
          errcode: 'M_GUEST_ACCESS_FORBIDDEN',
          error: 'Guest access not allowed',
        })
      )
  )
  .expectBadge({
    label: 'chat',
    message: 'room not world readable or is invalid',
    color: 'lightgrey',
  })

t.create('invalid token')
  .get('/ALIAS:DUMMY.dumb.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get(
        '/_matrix/client/r0/directory/room/%23ALIAS%3ADUMMY.dumb?access_token=TOKEN'
      )
      .reply(
        401,
        JSON.stringify({
          errcode: 'M_UNKNOWN_TOKEN',
          error: 'Unrecognised access token.',
        })
      )
  )
  .expectBadge({
    label: 'chat',
    message: 'bad auth token',
    color: 'lightgrey',
  })

t.create('unknown request')
  .get('/ALIAS:DUMMY.dumb.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get(
        '/_matrix/client/r0/directory/room/%23ALIAS%3ADUMMY.dumb?access_token=TOKEN'
      )
      .reply(
        200,
        JSON.stringify({
          room_id: 'ROOM:DUMMY.dumb',
        })
      )
      .get(
        '/_matrix/client/r0/rooms/ROOM%3ADUMMY.dumb/state?access_token=TOKEN'
      )
      .reply(
        400,
        JSON.stringify({
          errcode: 'M_UNRECOGNIZED',
          error: 'Unrecognized request',
        })
      )
  )
  .expectBadge({
    label: 'chat',
    message: 'unknown request',
    color: 'lightgrey',
  })

t.create('unknown alias')
  .get('/ALIAS:DUMMY.dumb.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get(
        '/_matrix/client/r0/directory/room/%23ALIAS%3ADUMMY.dumb?access_token=TOKEN'
      )
      .reply(
        404,
        JSON.stringify({
          errcode: 'M_NOT_FOUND',
          error: 'Room alias #ALIAS%3ADUMMY.dumb not found.',
        })
      )
  )
  .expectBadge({
    label: 'chat',
    message: 'room not found',
    color: 'red',
  })

t.create('invalid alias').get('/ALIASDUMMY.dumb.json').expectBadge({
  label: 'chat',
  message: 'invalid alias',
  color: 'red',
})

t.create('server uses a custom port')
  .get('/ALIAS:DUMMY.dumb:5555.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb:5555/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get(
        '/_matrix/client/r0/directory/room/%23ALIAS%3ADUMMY.dumb%3A5555?access_token=TOKEN'
      )
      .reply(
        200,
        JSON.stringify({
          room_id: 'ROOM:DUMMY.dumb:5555',
        })
      )
      .get(
        '/_matrix/client/r0/rooms/ROOM%3ADUMMY.dumb%3A5555/state?access_token=TOKEN'
      )
      .reply(
        200,
        JSON.stringify([
          {
            // valid user 1
            type: 'm.room.member',
            sender: '@user1:DUMMY.dumb:5555',
            state_key: '@user1:DUMMY.dumb:5555',
            content: {
              membership: 'join',
            },
          },
          {
            // valid user 2
            type: 'm.room.member',
            sender: '@user2:DUMMY.dumb:5555',
            state_key: '@user2:DUMMY.dumb:5555',
            content: {
              membership: 'join',
            },
          },
          {
            // should exclude banned/invited/left members
            type: 'm.room.member',
            sender: '@user3:DUMMY.dumb:5555',
            state_key: '@user3:DUMMY.dumb:5555',
            content: {
              membership: 'leave',
            },
          },
          {
            // exclude events like the room name
            type: 'm.room.name',
            sender: '@user4:DUMMY.dumb:5555',
            state_key: '@user4:DUMMY.dumb:5555',
            content: {
              membership: 'fake room',
            },
          },
        ])
      )
  )
  .expectBadge({
    label: 'chat',
    message: '2 users',
    color: 'brightgreen',
  })

t.create('specify the homeserver fqdn')
  .get('/ALIAS:DUMMY.dumb.json?server_fqdn=matrix.DUMMY.dumb')
  .intercept(nock =>
    nock('https://matrix.DUMMY.dumb/')
      .post('/_matrix/client/r0/register?kind=guest')
      .reply(
        200,
        JSON.stringify({
          access_token: 'TOKEN',
        })
      )
      .get(
        '/_matrix/client/r0/directory/room/%23ALIAS%3ADUMMY.dumb?access_token=TOKEN'
      )
      .reply(
        200,
        JSON.stringify({
          room_id: 'ROOM:DUMMY.dumb',
        })
      )
      .get(
        '/_matrix/client/r0/rooms/ROOM%3ADUMMY.dumb/state?access_token=TOKEN'
      )
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
  .expectBadge({
    label: 'chat',
    message: '2 users',
    color: 'brightgreen',
  })

t.create('test on real matrix room for API compliance')
  .get('/twim:matrix.org.json')
  .timeout(10000)
  .expectBadge({
    label: 'chat',
    message: Joi.string().regex(/^[0-9]+ users$/),
    color: 'brightgreen',
  })
