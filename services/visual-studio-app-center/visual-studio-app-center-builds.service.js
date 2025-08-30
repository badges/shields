import { deprecatedService } from '../index.js'

// Visual Studio App Center was retired. See: https://learn.microsoft.com/en-us/appcenter/retirement
const VisualStudioAppCenterBuilds = deprecatedService({
  category: 'build',
  route: {
    base: 'visual-studio-app-center/builds',
    pattern: ':owner/:app/:branch/:token',
  },
  label: 'build',
  dateAdded: new Date('2025-08-30'),
})

export default VisualStudioAppCenterBuilds
