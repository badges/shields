'use strict'

import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child-process-promise'
import { expect, use } from 'chai'
import sinonChai from 'sinon-chai'
use(sinonChai)

const dirName = path.dirname(fileURLToPath(import.meta.url))

function runCli(args) {
  return spawn('node', [path.join(dirName, 'badge-cli.js'), ...args], {
    capture: ['stdout'],
  })
}

describe('The CLI', function () {
  it('should provide a help message', async function () {
    const { stdout } = await runCli([])
    expect(stdout.startsWith('Usage')).to.be.true
  })

  it('should produce default badges', async function () {
    const { default: isSvg } = await import('is-svg')
    const { stdout } = await runCli(['cactus', 'grown'])
    expect(stdout)
      .to.satisfy(isSvg)
      .and.to.include('cactus')
      .and.to.include('grown')
  })

  it('should produce colorschemed badges', async function () {
    const { default: isSvg } = await import('is-svg')
    const { stdout } = await runCli(['cactus', 'grown', ':green'])
    expect(stdout).to.satisfy(isSvg)
  })

  it('should produce right-color badges', async function () {
    const { default: isSvg } = await import('is-svg')
    const { stdout } = await runCli(['cactus', 'grown', '#abcdef'])
    expect(stdout).to.satisfy(isSvg).and.to.include('#abcdef')
  })
})
