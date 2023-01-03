import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'analysis',
  route: {
    base: 'lgtm/grade',
    pattern: ':various*',
  },
  label: 'lgtm grade',
  dateAdded: new Date('2023-01-03'),
})
