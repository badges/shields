'use strict';

const { expect } = require('chai');
const isPng = require('is-png');
const isSvg = require('is-svg');
const {spawn} = require('child-process-promise');

// https://github.com/badges/shields/pull/1419#discussion_r159957055
require('./register-chai-plugins.spec');

function runCli (args) {
  return spawn('node', ['lib/badge-cli.js', ...args], { capture: ['stdout'] })
    .then(result => result.stdout);
}

describe('The CLI', function () {
  it('should provide a help message', function () {
    return runCli([]).then(stdout => {
      expect(stdout).to.startWith('Usage');
    });
  });

  it('should produce default badges', function () {
    return runCli(['cactus', 'grown']).then(stdout => {
      expect(stdout)
        .to.satisfy(isSvg)
        .and.to.include('cactus')
        .and.to.include('grown');
    });
  });

  it('should produce colorschemed badges', function () {
    return runCli(['cactus', 'grown', ':green']).then(stdout => {
      expect(stdout).to.satisfy(isSvg);
    });
  });

  it('should produce right-color badges', function () {
    return runCli(['cactus', 'grown', '#abcdef']).then(stdout => {
      expect(stdout)
        .to.satisfy(isSvg)
        .and.to.include('#abcdef');
    });
  });

  it('should produce PNG badges', function () {
    const child = runCli(['cactus', 'grown', '.png']);

    // The buffering done by `child-process-promise` doesn't seem correctly to
    // handle binary data.
    let chunk;
    child.childProcess.stdout.once('data', data => { chunk = data; });

    return child.then(() => { expect(chunk).to.satisfy(isPng); });
  });
});
