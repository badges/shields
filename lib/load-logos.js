import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { svg2base64 } from './svg-helpers.js'

function loadLogos() {
  // Cache svg logos from disk in base64 string
  const logos = {}
  const logoDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'logo'
  )
  const logoFiles = fs.readdirSync(logoDir)
  logoFiles.forEach(filename => {
    if (filename[0] === '.') {
      return
    }
    // filename is eg, github.svg
    const svg = fs.readFileSync(`${logoDir}/${filename}`).toString()
    const base64 = svg2base64(svg)
    // logo is monochrome if it only has one fill= statement
    const isMonochrome = (svg.match(/fill="(.+?)"/g) || []).length === 1

    // eg, github
    const name = filename.slice(0, -'.svg'.length).toLowerCase()
    logos[name] = {
      isMonochrome,
      svg,
      base64,
    }
  })
  return logos
}

export default loadLogos
