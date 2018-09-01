'use strict'

const { InvalidResponse } = require('../services/errors')
const fastXmlParser = require('fast-xml-parser')

async function asJson({ buffer, res }) {
  try {
    return JSON.parse(buffer)
  } catch (err) {
    throw new InvalidResponse({
      prettyMessage: 'unparseable json response',
      underlyingError: err,
    })
  }
}

async function asXml({ buffer, res }) {
  if (fastXmlParser.validate(buffer) === true) {
    return fastXmlParser.parse(buffer)
  }
  throw new InvalidResponse({
    prettyMessage: 'unparseable xml response',
  })
}

module.exports = {
  asJson,
  asXml,
}
