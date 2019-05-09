'use strict'

const { isBuildStatus } = require('../build-status')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'circleci',
  title: 'Circle CI',
}))

t.create('circle ci (valid, without branch)')
  .get('/build/gh/RedSparr0w/node-csgo-parser.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('circle ci (valid repo, valid branch)')
  .get('/build/gh/RedSparr0w/node-csgo-parser/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('circle ci (valid repo, invalid branch)')
  .get('/build/gh/RedSparr0w/node-csgo-parser/not-a-real-branch.json')
  .expectBadge({
    label: 'build',
    message: 'no builds',
  })

t.create('circle ci (not found)')
  .get('/build/gh/PyvesB/EmptyRepo.json')
  .expectBadge({ label: 'build', message: 'project not found' })

t.create('circle ci (valid, with token)')
  .get(
    '/build/gh/RedSparr0w/node-csgo-parser/master.json?token=b90b5c49e59a4c67ba3a92f7992587ac7a0408c2'
  )
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('legacy route with VCS')
  .get('/project/github/RedSparr0w/node-csgo-parser.json', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/circleci/build/github/redsparr0w/node-csgo-parser.json'
  )

t.create('legacy route (assume "github" as a default VCS)')
  .get('/project/RedSparr0w/node-csgo-parser/master.json', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/circleci/build/gh/redsparr0w/node-csgo-parser/master.json'
  )

t.create('legacy route with token and VCS')
  .get(
    '/token/b90b5c49e59a4c67ba3a92f7992587ac7a0408c2/project/github/RedSparr0w/node-csgo-parser/master.json',
    { followRedirect: false }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/circleci/build/github/redsparr0w/node-csgo-parser/master.json?token=b90b5c49e59a4c67ba3a92f7992587ac7a0408c2'
  )

t.create('legacy route with token (assume "github" as a default VCS)')
  .get(
    '/token/b90b5c49e59a4c67ba3a92f7992587ac7a0408c2/project/RedSparr0w/node-csgo-parser/master.json',
    { followRedirect: false }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/circleci/build/gh/redsparr0w/node-csgo-parser/master.json?token=b90b5c49e59a4c67ba3a92f7992587ac7a0408c2'
  )
