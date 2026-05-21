import { redirector } from '../index.js'

export default redirector({
  category: 'static',
  name: 'StaticBadgeColonRedirect',
  route: {
    base: '',
    pattern: '\\::badgeContent',
  },
  transformPath: ({ badgeContent }) => `/badge/${badgeContent}`,
  dateAdded: new Date('2026-05-21'),
})
