import { decodeBadgeText } from './static-badge-path.js'

// Backwards-compatible name used by legacy redirectors.
function escapeFormat(text) {
  return decodeBadgeText(text)
}

export { escapeFormat }
