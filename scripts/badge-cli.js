import { fileURLToPath, URL } from 'url'
import config from 'config'
import ky from 'ky'
import emojic from 'emojic'
import Server from '../core/server/server.js'
import trace from '../core/base-service/trace.js'

function normalizeBadgeUrl(url) {
  // Provide a base URL in order to accept fragments.
  const { pathname, searchParams } = new URL(url, 'http://example.com')
  let newPath = pathname.replace('.svg', '')
  if (!newPath.endsWith('.json')) {
    newPath = `${newPath}.json`
  }
  return `${newPath}?${searchParams.toString()}`
}

async function traceBadge(badgeUrl) {
  const server = new Server(config.util.toObject())
  await server.start()
  const body = await ky(`${server.baseUrl.replace(/\/$/, '')}${badgeUrl}`, {
    timeout: false,
  }).json()
  trace.logTrace('outbound', emojic.shield, 'Rendered badge', body)
  await server.stop()
}

async function main() {
  if (process.argv.length < 3) {
    console.error(`Usage: node ${fileURLToPath(import.meta.url)} badge-url`)
    process.exit(1)
  }
  const [, , url] = process.argv
  const normalized = normalizeBadgeUrl(url)
  await traceBadge(normalized)
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
