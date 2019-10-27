'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Go version')
  .get('/gohugoio/hugo.json')
  .expectBadge({
    label: 'Go',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Go version (from branch)')
  .get('/gohugoio/hugo/master.json')
  .expectBadge({
    label: 'Go@master',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Go version (mongorepo)')
  .get(`/golang/go.json?filename=${encodeURIComponent('src/go.mod')}`)
  .expectBadge({
    label: 'Go',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Go version (repo not found)')
  .get('/badges/not-existing-repo.json')
  .expectBadge({
    label: 'Go',
    message: 'repo not found, branch not found, or go.mod missing',
  })

t.create('Go version (missing Go version in go.mod)')
  .get('/gohugoio/hugo.json')
  .intercept(nock =>
    nock('https://api.github.com/')
      .get('/repos/gohugoio/hugo/contents/go.mod?ref=master')
      .reply(
        200,
        '{"content": "bW9kdWxlIGdpdGh1Yi5jb20vZ29odWdvaW8vaHVnbw==", "encoding": "base64"}'
      )
  )
  .expectBadge({
    label: 'Go',
    message: 'Go version missing in go.mod',
  })
