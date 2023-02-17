import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'analysis',
  route: {
    base: 'lgtm/alerts',
    pattern: ':various*',
  },
  label: 'lgtm alerts',
  dateAdded: new Date('2023-01-03'),
})
