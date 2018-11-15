'use strict'

const { promisify } = require('util')
const gm = require('gm')
const LruCache = require('./lru-cache')

const imageMagick = gm.subClass({ imageMagick: true })

// The following is an arbitrary limit (~1.5MB, 1.5kB/image).
const imgCache = new LruCache(1000)

async function svgToImg(svg, format) {
  const cacheIndex = `${format}${svg}`

  if (imgCache.has(cacheIndex)) {
    return imgCache.get(cacheIndex)
  }

  const svgBuffer = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${svg}`
  )

  const chain = imageMagick(svgBuffer, `image.${format}`)
    .density(90)
    .background(format === 'jpg' ? '#FFFFFF' : 'none')
    .flatten()
  const toBuffer = chain.toBuffer.bind(chain)

  const data = await promisify(toBuffer)(format)

  imgCache.set(cacheIndex, data)
  return data
}

module.exports = svgToImg

// To simplify testing.
module.exports._imgCache = imgCache
module.exports._imageMagick = imageMagick
