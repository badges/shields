'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')

const t = new ServiceTester({ id: 'maven-central', title: 'Maven Central' })
module.exports = t

t.create('latest version')
  .get('/v/com.github.fabriziocucci/yacl4j.json') // http://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/
  .expectBadge({
    label: 'maven-central',
    message: Joi.string().regex(/^v(.*)$/),
  })

t.create('latest 0.8 version')
  .get('/v/com.github.fabriziocucci/yacl4j/0.8.json') // http://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/
  .expectBadge({
    label: 'maven-central',
    message: Joi.string().regex(/^v0\.8(.*)$/),
  })

t.create('inexistent artifact')
  .get('/v/inexistent-group-id/inexistent-artifact-id.json')
  .expectBadge({ label: 'maven-central', message: 'not found' })

t.create('inexistent version prefix')
  .get('/v/com.github.fabriziocucci/yacl4j/99.json')
  .expectBadge({ label: 'maven-central', message: 'version prefix not found' })
