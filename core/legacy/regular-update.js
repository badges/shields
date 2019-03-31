'use strict'

const { Inaccessible, InvalidResponse } = require('../base-service/errors')

// Map from URL to { timestamp: last fetch time, data: data }.
let regularUpdateCache = Object.create(null)

// url: a string, scraper: a function that takes string data at that URL.
// interval: number in milliseconds.
// cb: a callback function that takes an error and data returned by the scraper.
//
// To use this from a service:
//
// const { promisify } = require('util')
// const { regularUpdate } = require('../../core/legacy/regular-update')
//
// function getThing() {
//   return promisify(regularUpdate)({
//     url: ...,
//     ...
//   })
// }
//
// in handle():
//
// const thing = await getThing()

function regularUpdate(
  {
    url,
    intervalMillis,
    json = true,
    scraper = buffer => buffer,
    options = {},
    request = require('request'),
  },
  cb
) {
  const timestamp = Date.now()
  const cached = regularUpdateCache[url]
  if (cached != null && timestamp - cached.timestamp < intervalMillis) {
    cb(null, cached.data)
    return
  }
  request(url, options, (err, res, buffer) => {
    if (err != null) {
      cb(
        new Inaccessible({
          prettyMessage: 'intermediate resource inaccessible',
          underlyingError: err,
        })
      )
      return
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      cb(
        new InvalidResponse({
          prettyMessage: 'intermediate resource inaccessible',
        })
      )
    }

    let reqData
    if (json) {
      try {
        reqData = JSON.parse(buffer)
      } catch (e) {
        cb(
          new InvalidResponse({
            prettyMessage: 'unparseable intermediate json response',
            underlyingError: e,
          })
        )
        return
      }
    } else {
      reqData = buffer
    }

    let data
    try {
      data = scraper(reqData)
    } catch (e) {
      cb(e)
      return
    }

    regularUpdateCache[url] = { timestamp, data }
    cb(null, data)
  })
}

function clearRegularUpdateCache() {
  regularUpdateCache = Object.create(null)
}

module.exports = {
  regularUpdate,
  clearRegularUpdateCache,
}
