import { deprecatedService } from '../index.js'

const dateAdded = new Date('2026-04-09')
const label = 'visual-studio-marketplace'
const pattern = ':various+'

export default [
  // Downloads / Installs
  deprecatedService({
    category: 'downloads',
    route: { base: 'visual-studio-marketplace/d', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'downloads',
    route: { base: 'visual-studio-marketplace/i', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'downloads',
    route: { base: 'vscode-marketplace/d', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'downloads',
    route: { base: 'vscode-marketplace/i', pattern },
    label,
    dateAdded,
  }),

  // Version
  deprecatedService({
    category: 'version',
    route: { base: 'visual-studio-marketplace/v', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'version',
    route: { base: 'vscode-marketplace/v', pattern },
    label,
    dateAdded,
  }),

  // Rating / Stars
  deprecatedService({
    category: 'rating',
    route: { base: 'visual-studio-marketplace/r', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'rating',
    route: { base: 'visual-studio-marketplace/stars', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'rating',
    route: { base: 'vscode-marketplace/r', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'rating',
    route: { base: 'vscode-marketplace/stars', pattern },
    label,
    dateAdded,
  }),

  // Release date / Last updated
  deprecatedService({
    category: 'activity',
    route: { base: 'visual-studio-marketplace/release-date', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'activity',
    route: { base: 'vscode-marketplace/release-date', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'activity',
    route: { base: 'visual-studio-marketplace/last-updated', pattern },
    label,
    dateAdded,
  }),
  deprecatedService({
    category: 'activity',
    route: { base: 'vscode-marketplace/last-updated', pattern },
    label,
    dateAdded,
  }),

  // Azure DevOps installs (covers measure/extensionId segments)
  deprecatedService({
    category: 'downloads',
    route: { base: 'visual-studio-marketplace/azure-devops/installs', pattern },
    label,
    dateAdded,
  }),
]
