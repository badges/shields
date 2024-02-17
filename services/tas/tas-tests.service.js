import { deprecatedService } from '../index.js'

const TasBuildStatus = deprecatedService({
  category: 'test-results',
  route: {
    base: 'tas/tests',
    pattern: ':provider/:org/:repo',
  },
  label: 'tests',
  dateAdded: new Date('2024-01-29'),
})

export default TasBuildStatus
