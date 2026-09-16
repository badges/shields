import { retiredService } from '../index.js'

const dateAdded = new Date('2026-04-09')
const label = 'visual-studio-marketplace'
const pattern = ':various+'

export default [
  // Downloads / Installs
  retiredService({
    category: 'downloads',
    route: { base: 'visual-studio-marketplace/d', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'downloads',
    route: { base: 'visual-studio-marketplace/i', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'downloads',
    route: { base: 'vscode-marketplace/d', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'downloads',
    route: { base: 'vscode-marketplace/i', pattern },
    label,
    dateAdded,
  }),

  // Version
  retiredService({
    category: 'version',
    route: { base: 'visual-studio-marketplace/v', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'version',
    route: { base: 'vscode-marketplace/v', pattern },
    label,
    dateAdded,
  }),

  // Rating / Stars
  retiredService({
    category: 'rating',
    route: { base: 'visual-studio-marketplace/r', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'rating',
    route: { base: 'visual-studio-marketplace/stars', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'rating',
    route: { base: 'vscode-marketplace/r', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'rating',
    route: { base: 'vscode-marketplace/stars', pattern },
    label,
    dateAdded,
  }),

  // Release date / Last updated
  retiredService({
    category: 'activity',
    route: { base: 'visual-studio-marketplace/release-date', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'activity',
    route: { base: 'vscode-marketplace/release-date', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'activity',
    route: { base: 'visual-studio-marketplace/last-updated', pattern },
    label,
    dateAdded,
  }),
  retiredService({
    category: 'activity',
    route: { base: 'vscode-marketplace/last-updated', pattern },
    label,
    dateAdded,
  }),

  // Azure DevOps installs (covers measure/extensionId segments)
  retiredService({
    category: 'downloads',
    route: { base: 'visual-studio-marketplace/azure-devops/installs', pattern },
    label,
    dateAdded,
  }),
]
