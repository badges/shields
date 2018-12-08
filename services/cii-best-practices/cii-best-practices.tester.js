'use strict'

const Joi = require('joi')
const t = require('../create-service-tester')()
module.exports = t

t.create('live: level known project')
  .get(`/level/1.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'cii',
      value: Joi.string(),
    })
  )

t.create('live: percentage known project')
  .get(`/percentage/29.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'cii',
      value: Joi.string(),
    })
  )

t.create('live: default known project')
  .get(`/default/33.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'cii',
      value: Joi.string(),
    })
  )

t.create('live: unknown project')
  .get(`/level/abc.json`)
  .expectJSON({ name: 'cii', value: 'project not found' })

t.create('level: unknown project')
  .get(`/level/2.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/2/badge.json')
      .reply(404)
  )
  .expectJSON({
    name: 'cii',
    value: 'project not found',
  })

t.create('level: gold project')
  .get(`/level/1.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/1/badge.json')
      .reply(200, {
        badge_level: 'gold',
        tiered_percentage: 300,
      })
  )
  .expectJSON({
    name: 'cii',
    value: 'gold',
  })

t.create('level: silver project')
  .get(`/level/34.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/34/badge.json')
      .reply(200, {
        badge_level: 'silver',
        tiered_percentage: 297,
      })
  )
  .expectJSON({
    name: 'cii',
    value: 'silver',
  })

t.create('level: passing project')
  .get(`/level/29.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/29/badge.json')
      .reply(200, {
        badge_level: 'passing',
        tiered_percentage: 107,
      })
  )
  .expectJSON({
    name: 'cii',
    value: 'passing',
  })

t.create('level: in progress project')
  .get(`/level/33.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/33/badge.json')
      .reply(200, {
        badge_level: 'in_progress',
        tiered_percentage: 94,
      })
  )
  .expectJSON({
    name: 'cii',
    value: 'in progress',
  })

t.create('percentage: unknown project')
  .get(`/percentage/2.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/2/badge.json')
      .reply(404)
  )
  .expectJSON({
    name: 'cii',
    value: 'project not found',
  })

t.create('percentage: gold project')
  .get(`/percentage/1.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/1/badge.json')
      .reply(200, {
        badge_level: 'gold',
        tiered_percentage: 300,
      })
  )
  .expectJSON({
    name: 'cii',
    value: '300%',
  })

t.create('percentage: silver project')
  .get(`/percentage/34.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/34/badge.json')
      .reply(200, {
        badge_level: 'silver',
        tiered_percentage: 297,
      })
  )
  .expectJSON({
    name: 'cii',
    value: '297%',
  })

t.create('percentage: passing project')
  .get(`/percentage/29.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/29/badge.json')
      .reply(200, {
        badge_level: 'passing',
        tiered_percentage: 107,
      })
  )
  .expectJSON({
    name: 'cii',
    value: '107%',
  })

t.create('percentage: in progress project')
  .get(`/percentage/33.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/33/badge.json')
      .reply(200, {
        badge_level: 'in_progress',
        tiered_percentage: 94,
      })
  )
  .expectJSON({
    name: 'cii',
    value: '94%',
  })

t.create('default: unknown project')
  .get(`/default/2.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/2/badge.json')
      .reply(404)
  )
  .expectJSON({
    name: 'cii',
    value: 'project not found',
  })

t.create('default: gold project')
  .get(`/default/1.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/1/badge.json')
      .reply(200, {
        badge_level: 'gold',
        tiered_percentage: 300,
      })
  )
  .expectJSON({
    name: 'cii',
    value: 'gold',
  })

t.create('default: silver project')
  .get(`/default/34.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/34/badge.json')
      .reply(200, {
        badge_level: 'silver',
        tiered_percentage: 297,
      })
  )
  .expectJSON({
    name: 'cii',
    value: 'silver',
  })

t.create('default: passing project')
  .get(`/default/29.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/29/badge.json')
      .reply(200, {
        badge_level: 'passing',
        tiered_percentage: 107,
      })
  )
  .expectJSON({
    name: 'cii',
    value: 'passing',
  })

t.create('default: in progress project')
  .get(`/default/33.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org/projects')
      .get('/33/badge.json')
      .reply(200, {
        badge_level: 'in_progress',
        tiered_percentage: 94,
      })
  )
  .expectJSON({
    name: 'cii',
    value: 'in progress 94%',
  })
