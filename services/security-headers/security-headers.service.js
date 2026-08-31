import { retiredService } from '../index.js'

export const SecurityHeaders = retiredService({
  category: 'monitoring',
  route: {
    base: 'security-headers',
    pattern: ':various+',
  },
  label: 'securityheaders',
  dateAdded: new Date('2025-11-08'),
})
