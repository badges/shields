import { redirector } from '../index.js'

export default redirector({
  // SourceForge commit count service used to only have project name as a parameter
  // and the repository name was always `git`.
  // The service was later updated to have the repository name as a parameter.
  // This redirector is used to keep the old URLs working.
  category: 'activity',
  route: {
    base: 'sourceforge/commit-count',
    pattern: ':project',
  },
  transformPath: ({ project }) => `/sourceforge/commit-count/${project}/git`,
  dateAdded: new Date('2025-03-15'),
})
