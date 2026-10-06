import { redirector } from '../index.js'

export default redirector({
  category: 'build',
  route: {
    base: 'readthedocs',
    pattern: ':project/:version?',
  },
  transformPath: ({ project, version }) =>
    version
      ? `/readthedocs.org/${project}/${version}`
      : `/readthedocs.org/${project}`,
  dateAdded: new Date('2026-10-06'),
})
