const cache = new Map()

export async function getCachedResource(
  { url, requestFetcher },
  ttl = 5 * 60 * 1000,
) {
  if (!requestFetcher) {
    throw new Error('requestFetcher is required')
  }
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }

  try {
    const response = await requestFetcher(url)
    const data = await response.json()
    cache.set(url, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    if (error instanceof Error) {
      return `Inaccessible: ${error.message}`
    }
    return 'Invalid JSON'
  }
}

export function clearResourceCache() {
  cache.clear()
}
