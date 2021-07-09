import { deprecatedService } from '../index.js'

export default deprecatedService({
  route: {
    base: 'jitpack',
    pattern: ':interval(dw|dm)/:various*',
  },
  label: 'jitpack',
  category: 'downloads',
  dateAdded: new Date('2020-04-05'),
})
