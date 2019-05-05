'use strict'

const { isBuildStatus } = require('../build-status')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'circleci',
  title: 'Circle CI',
}))

t.create('circle ci (valid, without branch)')
  .get('/project/github/RedSparr0w/node-csgo-parser.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('circle ci (valid repo, valid branch)')
  .get('/project/github/RedSparr0w/node-csgo-parser/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('circle ci (valid repo, invalid branch)')
  .get('/project/github/RedSparr0w/node-csgo-parser/not-a-real-branch.json')
  .expectBadge({
    label: 'build',
    message: 'no builds',
  })

t.create('build status with "github" as a default VCS')
  .get('/project/RedSparr0w/node-csgo-parser/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('circle ci (valid, with token)')
  .get(
    '/token/b90b5c49e59a4c67ba3a92f7992587ac7a0408c2/project/github/RedSparr0w/node-csgo-parser/master.json'
  )
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('circle ci (not found)')
  .get('/project/github/PyvesB/EmptyRepo.json')
  .expectBadge({ label: 'build', message: 'project not found' })
