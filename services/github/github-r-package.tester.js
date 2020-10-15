'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const mockContent = (path, versionLine) => nock => {
  const content = [
    'Package: mypackage',
    'Title: What The Package Does (one line, title case required)',
    versionLine,
    '',
  ].join('\n')

  return nock('https://api.github.com')
    .get(`/repos/mixOmicsTeam/mixOmics/contents/${path}`)
    .query({ ref: 'HEAD' })
    .reply(200, {
      content: Buffer.from(content, 'utf-8').toString('base64'),
      encoding: 'base64',
    })
}

t.create('R package version').get('/mixOmicsTeam/mixOmics.json').expectBadge({
  label: 'R',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('R package version (from branch)')
  .get('/mixOmicsTeam/mixOmics/master.json')
  .expectBadge({
    label: 'R@master',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('R package version (monorepo)')
  .get(
    `/mixOmicsTeam/mixOmics.json?filename=${encodeURIComponent(
      'subdirectory/DESCRIPTION'
    )}`
  )
  .intercept(mockContent('subdirectory/DESCRIPTION', 'Version: 6.10.9'))
  .expectBadge({
    label: 'R',
    message: 'v6.10.9',
  })

t.create('R package version (repo not found)')
  .get('/badges/not-existing-repo.json')
  .expectBadge({
    label: 'R',
    message: 'repo not found, branch not found, or DESCRIPTION missing',
  })

t.create('R package version (Version missing in DESCRIPTION)')
  .get('/mixOmicsTeam/mixOmics.json')
  .intercept(mockContent('DESCRIPTION', 'Versio: 6.10.9'))
  .expectBadge({
    label: 'R',
    message: 'Version missing in DESCRIPTION',
  })
