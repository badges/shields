'use strict'

const path = require('path')
const isSvg = require('is-svg')
const { spawn } = require('child-process-promise')
const { expect, use } = require('chai')
use(require('chai-string'))
use(require('sinon-chai'))

function runCli(args) {
  return spawn('node', [path.join(__dirname, 'badge-cli.js'), ...args], {
    capture: ['stdout'],
  })
}

describe('The CLI', function () {
  it('should provide a help message', async function () {
    const { stdout } = await runCli([])
    expect(stdout).to.startWith('Usage')
  })

  it('should produce default badges', async function () {
    const { stdout } = await runCli(['cactus', 'grown'])
    expect(stdout)
      .to.satisfy(isSvg)
      .and.to.include('cactus')
      .and.to.include('grown')
  })

  it('should produce colorschemed badges', async function () {
    const { stdout } = await runCli(['cactus', 'grown', ':green'])
    expect(stdout).to.satisfy(isSvg)
  })

  it('should produce right-color badges', async function () {
    const { stdout } = await runCli(['cactus', 'grown', '#abcdef'])
    expect(stdout).to.satisfy(isSvg).and.to.include('#abcdef')
  })
})
