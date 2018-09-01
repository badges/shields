'use strict'

const { InvalidResponse } = require('../services/errors')
const xml2js = require('xml2js')

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
  let xml
  xml2js.parseString(buffer, (err, parsedData) => {
    if (err != null) {
      throw new InvalidResponse({
        prettyMessage: 'unparseable xml response',
        underlyingError: err,
      })
    }
    xml = parsedData
  })
  return xml
}

module.exports = {
  asJson,
  asXml,
}
