'use strict'

const { promisify } = require('util')
const gm = require('gm')

const imageMagick = gm.subClass({ imageMagick: true })

async function svgToImg(svg, format) {
  const svgBuffer = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${svg}`
  )

  const chain = imageMagick(svgBuffer, `image.${format}`)
    .density(90)
    .background(format === 'jpg' ? '#FFFFFF' : 'none')
    .flatten()
  const toBuffer = chain.toBuffer.bind(chain)

  return promisify(toBuffer)(format)
}

module.exports = svgToImg

// To simplify testing.
module.exports._imageMagick = imageMagick
