'use strict'

const { expect } = require('chai')
const isPng = require('is-png')
const isSvg = require('is-svg')
const { spawn } = require('child-process-promise')

// https://github.com/badges/shields/pull/1419#discussion_r159957055
require('./register-chai-plugins.spec')

function runCli(args) {
  return spawn('node', ['lib/badge-cli.js', ...args], { capture: ['stdout'] })
}

describe('The CLI', function() {
  it('should provide a help message', async function() {
    const { stdout } = await runCli([])
    expect(stdout).to.startWith('Usage')
  })

  it('should produce default badges', async function() {
    const { stdout } = await runCli(['cactus', 'grown'])
    expect(stdout)
      .to.satisfy(isSvg)
      .and.to.include('cactus')
      .and.to.include('grown')
  })

  it('should produce colorschemed badges', async function() {
    const { stdout } = await runCli(['cactus', 'grown', ':green'])
    expect(stdout).to.satisfy(isSvg)
  })

  it('should produce right-color badges', async function() {
    const { stdout } = await runCli(['cactus', 'grown', '#abcdef'])
    expect(stdout)
      .to.satisfy(isSvg)
      .and.to.include('#abcdef')
  })

  it('should produce PNG badges', async function() {
    const child = runCli(['cactus', 'grown', '.png'])

    // The buffering done by `child-process-promise` doesn't seem correctly to
    // handle binary data.
    let chunk
    child.childProcess.stdout.once('data', data => {
      chunk = data
    })

    await child

    expect(chunk).to.satisfy(isPng)
  })
})
