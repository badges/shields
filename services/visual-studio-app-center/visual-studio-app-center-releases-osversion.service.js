import { deprecatedService } from '../index.js'

// Visual Studio App Center was retired. See: https://learn.microsoft.com/en-us/appcenter/retirement
const VisualStudioAppCenterReleasesOSVersion = deprecatedService({
  category: 'version',
  route: {
    base: 'visual-studio-app-center/releases/osver',
    pattern: ':owner/:app/:token',
  },
  label: 'visualstudioappcenter',
  dateAdded: new Date('2025-08-30'),
})

export default VisualStudioAppCenterReleasesOSVersion
