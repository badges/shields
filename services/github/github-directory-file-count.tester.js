'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const mockContents = nock => {
  const contents = [
    { path: 'a', type: 'dir' },
    { path: 'b', type: 'dir' },
    { path: 'c.js', type: 'file' },
    { path: 'd.js', type: 'file' },
    { path: 'e.txt', type: 'file' },
  ]
  return nock('https://api.github.com')
    .get('/repos/badges/shields/contents/services')
    .reply(200, contents)
}

t.create('directory file count')
  .get('/badges/shields/services.json')
  .expectBadge({
    label: 'files',
    message: isMetric,
  })

t.create('directory file count (root)')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'files',
    message: /^[0-9]+$/,
  })

t.create('directory file count (directory not found)')
  .get('/badges/shields/not_existing_directory.json')
  .expectBadge({
    label: 'files',
    message: 'repo or directory not found',
  })

t.create('directory file count (not a directory)')
  .get('/badges/shields/package.json.json')
  .expectBadge({
    label: 'files',
    message: 'not a directory',
  })

t.create('directory file count (dir type)')
  .get('/badges/shields/services.json?type=dir')
  .intercept(mockContents)
  .expectBadge({
    label: 'files',
    message: '2',
  })

t.create('directory file count (file type)')
  .get('/badges/shields/services.json?type=file')
  .intercept(mockContents)
  .expectBadge({
    label: 'files',
    message: '3',
  })

t.create('directory file count (invalid type)')
  .get('/badges/shields/services.json?type=submodule')
  .expectBadge({
    label: 'files',
    message: 'invalid query parameter: type',
  })

t.create('directory file count (file extension)')
  .get('/badges/shields/services.json?extension=js')
  .intercept(mockContents)
  .expectBadge({
    label: 'files',
    message: '2',
  })
