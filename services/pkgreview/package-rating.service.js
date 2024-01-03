import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'rating',
  route: {
    base: 'pkgreview',
    pattern: ':various*',
  },
  label: 'pkgreview',
  dateAdded: new Date('2022-10-07'),
})
