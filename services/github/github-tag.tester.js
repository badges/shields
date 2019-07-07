'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Tag')
  .get('/tag/photonstorm/phaser.json')
  .expectBadge({ label: 'tag', message: Joi.string() })

t.create('Tag (inc pre-release)')
  .get('/tag-pre/photonstorm/phaser.json')
  .expectBadge({ label: 'tag', message: Joi.string() })

t.create('Tag (no tags)')
  .get('/tag/badges/daily-tests.json')
  .expectBadge({ label: 'tag', message: 'none' })

t.create('Tag (repo not found)')
  .get('/tag/badges/helmets.json')
  .expectBadge({ label: 'tag', message: 'repo not found' })
