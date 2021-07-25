export default function coalesce(...candidates) {
  return candidates.find(c => c !== undefined && c !== null)
}
