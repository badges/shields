'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Total Stars (User)')
  .get('/hemantsonu20/total-stars.json')
  .expectBadge({
    label: 'Total Stars',
    message: Joi.number().integer().positive(),
    link: ['https://github.com/hemantsonu20'],
  })

t.create('Total Stars (User) with affiliations')
  .get('/hemantsonu20/total-stars.json?affiliations=OWNER,COLLABORATOR')
  .expectBadge({
    label: 'Total Stars',
    message: Joi.number().integer().positive(),
    link: ['https://github.com/hemantsonu20'],
  })

t.create('Total Stars (User) with invalid affiliations')
  .get('/hemantsonu20/total-stars.json?affiliations=UNKNOWN')
  .expectBadge({
    label: 'Total Stars',
    message: 'invalid query parameter: affiliations',
    link: [],
  })

t.create('Total Stars (User) with invalid affiliations space')
  .get('/hemantsonu20/total-stars.json?affiliations=OWNER, COLLABORATOR')
  .expectBadge({
    label: 'Total Stars',
    message: 'invalid query parameter: affiliations',
    link: [],
  })

t.create('Total Stars (User) unknown user')
  .get('/hemantsonu20-fake-user/total-stars.json')
  .expectBadge({
    label: 'Total Stars',
    message: 'user not found',
    link: [],
  })

t.create('Total Stars (Org)')
  .get('/badges/total-stars.json?org')
  .expectBadge({
    label: 'Total Stars',
    message: Joi.string().regex(/\d+k/), // matches format 13k
    link: ['https://github.com/badges'],
  })

t.create('Total Stars (Org) Lots of repo')
  .get('/github/total-stars.json?org')
  .expectBadge({
    label: 'Total Stars',
    message: Joi.string().regex(/\d+k/), // matches format 303k
    link: ['https://github.com/github'],
  })

t.create('Total Stars (Org) unknown org')
  .get('/badges-fake/total-stars.json?org')
  .expectBadge({
    label: 'Total Stars',
    message: 'organization not found',
    link: [],
  })
