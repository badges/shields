import { deprecatedService } from '../index.js'

export const SecurityHeaders = deprecatedService({
  category: 'monitoring',
  route: {
    base: 'security-headers',
    pattern: ':various+',
  },
  label: 'securityheaders',
  dateAdded: new Date('2025-11-08'),
})
