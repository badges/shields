import SVGPathCommander from 'svg-path-commander'
import loadSimpleIcons from './load-simple-icons.js'

function svg2base64(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg.trim()).toString(
    'base64',
  )}`
}

function getIconSize(iconKey) {
  const simpleIcons = loadSimpleIcons()

  if (!(iconKey in simpleIcons)) {
    return undefined
  }

  const {
    width,
    height,
    x: x0,
    y: y0,
    x2: x1,
    y2: y1,
  } = SVGPathCommander.getPathBBox(simpleIcons[iconKey].path)

  return { width, height, x0, y0, x1, y1 }
}

function resetIconPosition(path) {
  const { x: offsetX, y: offsetY } = SVGPathCommander.getPathBBox(path)
  const pathReset = new SVGPathCommander(path)
    .transform({ translate: [-offsetX, -offsetY] })
    .toString()

  return pathReset
}

export { svg2base64, getIconSize, resetIconPosition }
