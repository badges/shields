'use strict'

const fs = require('fs')
const path = require('path')

const secretsPath = path.join(__dirname, '..', 'private', 'secret.json')

if (fs.existsSync(secretsPath)) {
  console.log('Found existing private/secret.json, not overwriting.')
} else {
  console.log('private/secret.json does not exist, creating.')
  const privatePath = path.dirname(secretsPath)
  if (!fs.existsSync(privatePath)) {
    fs.mkdirSync(privatePath)
  }
  const secrets = { wheelmap_token: process.env.WHEELMAP_TOKEN }
  const secretsString = JSON.stringify(secrets)
  fs.writeFileSync(secretsPath, secretsString)
}
