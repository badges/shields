import { deprecatedService } from '../index.js'

export const TreewareTrees = deprecatedService({
  category: 'other',
  route: {
    base: 'treeware/trees',
    pattern: ':various*',
  },
  label: 'trees',
  dateAdded: new Date('2024-08-18'),
})
