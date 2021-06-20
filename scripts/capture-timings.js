import readline from 'readline'
import minimist from 'minimist'

async function captureTimings(warmupIterations) {
  const rl = readline.createInterface({
    input: process.stdin,
  })

  const times = {}
  let timingsCount = 0
  let labelsCount = 0
  const timing = /^(.+): ([0-9.]+)ms$/i

  for await (const line of rl) {
    const match = timing.exec(line)
    if (match) {
      labelsCount = Object.keys(times).length
      if (timingsCount > warmupIterations * labelsCount) {
        const label = match[1]
        const time = parseFloat(match[2])
        times[label] = time + (times[label] || 0)
      }
      ++timingsCount
    }
  }
  return { times, iterations: timingsCount / labelsCount }
}

function logResults({ times, iterations, warmupIterations }) {
  if (isNaN(iterations)) {
    console.log(
      `No timings captured. Have you included console.time statements in the badge creation code path?`
    )
  } else {
    const timedIterations = iterations - warmupIterations
    for (const [label, time] of Object.entries(times)) {
      const averageTime = time / timedIterations
      console.log(
        `Average '${label}' time over ${timedIterations} iterations: ${averageTime}ms`
      )
    }
  }
}

async function main() {
  const args = minimist(process.argv)
  const warmupIterations = parseInt(args['warmup-iterations']) || 100
  const { times, iterations } = await captureTimings(warmupIterations)
  logResults({ times, iterations, warmupIterations })
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
