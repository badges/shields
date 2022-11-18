import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'wercker',
    pattern: ':various*',
  },
  label: 'wercker',
  dateAdded: new Date('2022-11-18'),
})
