function svg2base64(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export { svg2base64 }
