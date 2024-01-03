import { deprecatedService } from '../index.js'

export const AnsibleGalaxyContentQualityScore = deprecatedService({
  category: 'analysis',
  route: {
    base: 'ansible/quality',
    pattern: ':projectId',
  },
  label: 'quality',
  dateAdded: new Date('2023-10-10'),
})
