import { deprecatedService } from '../index.js'

export const RedminePluginRating = deprecatedService({
  category: 'rating',
  route: {
    base: 'redmine/plugin/rating',
    pattern: ':various*',
  },
  label: 'redmine',
  dateAdded: new Date('2023-09-11'),
})

export const RedminePluginStars = deprecatedService({
  category: 'rating',
  route: {
    base: 'redmine/plugin/stars',
    pattern: ':various*',
  },
  label: 'redmine',
  dateAdded: new Date('2023-09-11'),
})
