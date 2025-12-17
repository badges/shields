import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'github/workflow/status',
    pattern: ':various+',
  },
  label: 'githubworkflowstatus',
  issueUrl: 'https://github.com/badges/shields/issues/8671',
  dateAdded: new Date('2025-11-29'),
})
