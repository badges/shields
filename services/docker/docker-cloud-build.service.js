import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'docker/cloud/build',
    pattern: ':user/:repo',
  },
  label: 'dockercloud',
  dateAdded: new Date('2025-11-15'),
})
