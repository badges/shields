'use strict'

const readline = require('readline')
const minimist = require('minimist')

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
  })

  const args = minimist(process.argv)
  const warmupIterations = parseInt(args['warmup-iterations']) || 100
  let iterations = 0
  let time = 0.0
  const timing = /^.*: ([0-9.]+)ms$/i
  for await (const line of rl) {
    const match = timing.exec(line)
    if (match) {
      if (iterations > warmupIterations) {
        time += parseFloat(match[1])
      }
      ++iterations
    }
  }
  const timedIterations = iterations - warmupIterations
  console.log(
    `Average time over ${timedIterations} iterations: ${time /
      timedIterations}ms`
  )
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
