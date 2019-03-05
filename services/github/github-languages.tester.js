'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isFileSize } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'GithubLanguages',
  title: 'GithubLanguages',
  pathPrefix: '/github/languages',
}))

t.create('top language')
  .get('/top/badges/shields.json')
  .expectBadge({
    label: 'javascript',
    message: Joi.string().regex(/^([1-9]?[0-9]\.[0-9]|100\.0)%$/),
  })

t.create('top language')
  .get('/top/badges/shields.json?colorB=123&format=_shields_test')
  .expectBadge({
    label: 'javascript',
    message: Joi.string().regex(/^([1-9]?[0-9]\.[0-9]|100\.0)%$/),
    color: '#123',
  })

t.create('top language with empty repository')
  .get('/top/pyvesb/emptyrepo.json')
  .expectBadge({ label: 'language', message: 'none' })

t.create('language count')
  .get('/count/badges/shields.json')
  .expectBadge({
    label: 'languages',
    message: Joi.number()
      .integer()
      .positive(),
  })

t.create('language count (repo not found)')
  .get('/count/badges/helmets.json')
  .expectBadge({
    label: 'languages',
    message: 'repo not found',
  })

t.create('code size in bytes for all languages')
  .get('/code-size/badges/shields.json')
  .expectBadge({
    label: 'code size',
    message: isFileSize,
  })
