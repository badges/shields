import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import { isStarRating } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'redmine',
  title: 'Redmine',
})

t.create('plugin rating')
  .get('/plugin/rating/redmine_xlsx_format_issue_exporter.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^[0-9]+\.[0-9]+\/5\.0$/),
  })

t.create('plugin stars')
  .get('/plugin/stars/redmine_xlsx_format_issue_exporter.json')
  .expectBadge({
    label: 'stars',
    message: isStarRating,
  })

t.create('plugin not found')
  .get('/plugin/rating/plugin_not_found.json')
  .expectBadge({
    label: 'redmine',
    message: 'not found',
  })
