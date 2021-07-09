import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'downloads',
  route: {
    base: 'versioneye/d',
    pattern: ':various+',
  },
  label: 'versioneye',
  dateAdded: new Date('2018-08-20'),
})
