import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'github/workflow/status',
    pattern: ':various+',
  },
  label: 'build',
  dateAdded: new Date('2022-10-03'),
})
