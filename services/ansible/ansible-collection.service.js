import { deprecatedService } from '../index.js'

export const AnsibleGalaxyCollectionName = deprecatedService({
  category: 'other',
  route: {
    base: 'ansible/collection',
    pattern: ':collectionId',
  },
  label: 'collection',
  dateAdded: new Date('2023-10-10'),
})
