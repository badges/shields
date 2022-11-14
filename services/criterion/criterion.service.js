import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'analysis',
  route: {
    base: 'criterion',
    pattern: ':various*',
  },
  label: 'criterion',
  dateAdded: new Date('2022-10-07'),
})
