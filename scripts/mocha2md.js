import fs from 'fs'

let data
let title

try {
  if (process.argv.length < 4) {
    throw new Error()
  }
  title = process.argv[2]
  data = JSON.parse(fs.readFileSync(process.argv[3]))
} catch (e) {
  process.stdout.write('failed to write summary\n')
  process.exit(1)
}

process.stdout.write(`# ${title}\n\n`)

if (data.stats.passes > 0) {
  process.stdout.write(`✔ ${data.stats.passes} passed\n`)
}
if (data.stats.failures > 0) {
  process.stdout.write(`✖ ${data.stats.failures} failed\n`)
}
if (data.stats.pending > 0) {
  process.stdout.write(`● ${data.stats.pending} pending\n`)
}
process.stdout.write('\n')

if (data.stats.failures > 0) {
  process.stdout.write('## Failures\n\n')
  for (const test of data.failures) {
    if (test.err && Object.keys(test.err).length > 0) {
      process.stdout.write(`${test.fullTitle}\n\n`)
      process.stdout.write('```\n')
      process.stdout.write(`${test.err.stack}\n`)
      process.stdout.write('```\n\n')
    }
  }
}

if (data.stats.pending > 0) {
  process.stdout.write('## Pending\n\n')
  for (const test of data.pending) {
    process.stdout.write(`${test.fullTitle}\n\n`)
  }
}
