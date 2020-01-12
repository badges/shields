'use strict'

const { promisify } = require('util')

let imageMagick
try {
  const gm = require('gm')
  imageMagick = gm.subClass({ imageMagick: true })
} catch (e) {
  imageMagick = false
}

async function svgToImg(svg, format) {
  if (!imageMagick) {
    throw new Error(
      `peerDependency gm is required for output in .${format} format`
    )
  }

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
