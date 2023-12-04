import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'redmine',
  title: 'Redmine',
})

t.create('plugin rating')
  .get('/plugin/rating/redmine_xlsx_format_issue_exporter.json')
  .expectBadge({
    label: 'redmine',
    message: 'no longer available',
  })

t.create('plugin stars')
  .get('/plugin/stars/redmine_xlsx_format_issue_exporter.json')
  .expectBadge({
    label: 'redmine',
    message: 'no longer available',
  })
