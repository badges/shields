const assert = require('assert');
const isPng = require('is-png');
const isSvg = require('is-svg');
const {spawn} = require('child-process-promise');

function runCli (args) {
  return spawn('node', ['gh-badge.js', ...args], { capture: ['stdout'] })
    .then(result => result.stdout);
}

describe('The CLI', function () {
  it('should provide a help message', function () {
    return runCli([]).then(stdout => {
      assert(stdout.startsWith('Usage'));
    });
  });

  it('should produce default badges', function () {
    return runCli(['cactus', 'grown']).then(stdout => {
      assert.ok(isSvg(stdout));
      assert.ok(stdout.includes('cactus'), 'cactus');
      assert.ok(stdout.includes('grown'), 'grown');
    });
  });

  it('should produce colorschemed badges', function () {
    return runCli(['cactus', 'grown', ':green']).then(stdout => {
      assert.ok(isSvg(stdout));
    });
  });

  it('should produce right-color badges', function () {
    return runCli(['cactus', 'grown', '#abcdef']).then(stdout => {
      assert.ok(isSvg(stdout));
      assert.ok(stdout.includes('#abcdef'), '#abcdef');
    });
  });

  it('should produce PNG badges', function () {
    const child = runCli(['cactus', 'grown', '.png']);

    // The buffering done by `child-process-promise` doesn't seem correctly to
    // handle binary data.
    let chunk;
    child.childProcess.stdout.once('data', data => { chunk = data; });

    return child.then(() => { assert.ok(isPng(chunk)); });
  });
});
