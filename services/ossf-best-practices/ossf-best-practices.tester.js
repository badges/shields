import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const projectId = '6367'

t.create('OSSF Best Practices (valid: in progress 0 <= percentage < 25)')
  .get(`/${projectId}.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org')
      .get(`/projects/${projectId}/badge.json`)
      .reply(200, { badge_level: 'in_progress', tiered_percentage: 20 })
  )
  .expectBadge({
    label: 'best practices',
    message: 'in progress 20%',
    color: 'red',
  })

t.create('OSSF Best Practices (valid: in progress 25 <= percentage < 50)')
  .get(`/${projectId}.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org')
      .get(`/projects/${projectId}/badge.json`)
      .reply(200, { badge_level: 'in_progress', tiered_percentage: 40 })
  )
  .expectBadge({
    label: 'best practices',
    message: 'in progress 40%',
    color: 'orange',
  })

t.create('OSSF Best Practices (valid: in progress 50 <= percentage < 75)')
  .get(`/${projectId}.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org')
      .get(`/projects/${projectId}/badge.json`)
      .reply(200, { badge_level: 'in_progress', tiered_percentage: 60 })
  )
  .expectBadge({
    label: 'best practices',
    message: 'in progress 60%',
    color: 'yellow',
  })

t.create('OSSF Best Practices (valid: in progress 75 <= percentage < 90)')
  .get(`/${projectId}.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org')
      .get(`/projects/${projectId}/badge.json`)
      .reply(200, { badge_level: 'in_progress', tiered_percentage: 80 })
  )
  .expectBadge({
    label: 'best practices',
    message: 'in progress 80%',
    color: 'yellowgreen',
  })

t.create('OSSF Best Practices (valid: in progress 90 <= percentage < 100)')
  .get(`/${projectId}.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org')
      .get(`/projects/${projectId}/badge.json`)
      .reply(200, { badge_level: 'in_progress', tiered_percentage: 95 })
  )
  .expectBadge({
    label: 'best practices',
    message: 'in progress 95%',
    color: 'green',
  })

t.create('OSSF Best Practices (valid: passing)')
  .get(`/${projectId}.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org')
      .get(`/projects/${projectId}/badge.json`)
      .reply(200, { badge_level: 'passing', tiered_percentage: 100 })
  )
  .expectBadge({
    label: 'best practices',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('OSSF Best Practices (valid: silver)')
  .get(`/${projectId}.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org')
      .get(`/projects/${projectId}/badge.json`)
      .reply(200, { badge_level: 'silver', tiered_percentage: 200 })
  )
  .expectBadge({
    label: 'best practices',
    message: 'silver',
    color: 'silver',
  })

t.create('OSSF Best Practices (valid: gold)')
  .get(`/${projectId}.json`)
  .intercept(nock =>
    nock('https://bestpractices.coreinfrastructure.org')
      .get(`/projects/${projectId}/badge.json`)
      .reply(200, { badge_level: 'gold', tiered_percentage: 300 })
  )
  .expectBadge({
    label: 'best practices',
    message: 'gold',
    color: 'gold',
  })

t.create('OSSF Best Practices (invalid)')
  .get('/invalid-project-id.json')
  .expectBadge({
    label: 'best practices',
    message: 'not found',
    color: 'red',
  })
