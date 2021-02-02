'use strict'

if (process.argv.length < 3 || !/^\d+$/.test(process.argv[2])) {
  console.log('Usage: npm run heroku:scale [num-dynos]')
  process.exit(0)
}
if (!('HEROKU_API_TOKEN' in process.env)) {
  throw new Error("'HEROKU_API_TOKEN' env var must be set")
}
if (!('HEROKU_APP_ID' in process.env)) {
  throw new Error("'HEROKU_APP_ID' env var must be set")
}

const Heroku = require('heroku-client')
const HEROKU_API_TOKEN = process.env.HEROKU_API_TOKEN
const HEROKU_APP_ID = process.env.HEROKU_APP_ID
const numDynos = parseInt(process.argv[2])

const heroku = new Heroku({ token: HEROKU_API_TOKEN })

;(async () => {
  const currentConfig = await heroku.get(`/apps/${HEROKU_APP_ID}/formation/web`)
  if (currentConfig.quantity === numDynos) {
    console.log(
      `Already running the desired number of dynos (${numDynos}). No changes necessary.`
    )
    process.exit(0)
  }

  console.log(`Scaling to ${numDynos} dynos...`)
  const newConfig = await heroku.patch(`/apps/${HEROKU_APP_ID}/formation/web`, {
    body: {
      quantity: numDynos,
    },
  })
  console.log(`..done!`)
  console.log(newConfig)
})()
