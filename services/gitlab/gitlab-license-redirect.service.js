import { redirector } from '../index.js'

// https://github.com/badges/shields/issues/8138
export default redirector({
  category: 'build',
  route: {
    base: 'gitlab/v/license',
    pattern: ':project+',
  },
  transformPath: ({ project }) => `/gitlab/license/${project}`,
  dateAdded: new Date('2022-06-29'),
})
