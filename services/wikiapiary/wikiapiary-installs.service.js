import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'downloads',
  route: {
    base: 'wikiapiary',
    pattern: ':various+',
  },
  label: 'wikiapiary',
  dateAdded: new Date('2025-11-30'),
})
