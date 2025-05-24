const cache = new Map()

async function fetchResource(url, requestFetcher) {
  if (!requestFetcher) {
    throw new Error('requestFetcher is required')
  }
  const response = await requestFetcher(url)
  return response.json()
}

export async function getCachedResource(
  { url, requestFetcher },
  ttl = 5 * 60 * 1000,
) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }

  try {
    const data = await fetchResource(url, requestFetcher)
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
