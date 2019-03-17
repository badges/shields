'use strict'

const yaml = require('js-yaml')
const { collectDefinitions } = require('../core/base-service/loader')

const definitions = collectDefinitions()

// Omit undefined
// https://github.com/nodeca/js-yaml/issues/356#issuecomment-312430599
const cleaned = JSON.parse(JSON.stringify(definitions))

process.stdout.write(yaml.safeDump(cleaned, { flowLevel: 5 }))
