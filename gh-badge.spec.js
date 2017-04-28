const assert = require('assert');
const isPng = require('is-png');
const isSvg = require('is-svg');
const {spawn} = require('child_process');

describe('The CLI', function () {
  it('should provide a help message', function (done) {
    const child = spawn('node', ['gh-badge.js']);
    let buffer = '';
    child.stdout.on('data', chunk => { buffer += ''+chunk; });
    child.stdout.on('end', () => {
      assert(buffer.startsWith('Usage'));
      done();
    });
  });

  it('should produce default badges', function (done) {
    const child = spawn('node', ['gh-badge.js', 'cactus', 'grown']);
    child.stdout.once('data', chunk => {
      const buffer = ''+chunk;
      assert.ok(isSvg(buffer));
      assert.ok(buffer.includes('cactus'), 'cactus');
      assert.ok(buffer.includes('grown'), 'grown');
      done();
    });
  });

  it('should produce colorschemed badges', function (done) {
    const child = spawn('node', ['gh-badge.js', 'cactus', 'grown', ':green']);
    child.stdout.once('data', chunk => {
      const buffer = ''+chunk;
      assert.ok(isSvg(buffer));
      done();
    });
  });

  it('should produce right-color badges', function (done) {
    const child = spawn('node', ['gh-badge.js', 'cactus', 'grown', '#abcdef']);
    child.stdout.once('data', chunk => {
      const buffer = ''+chunk;
      assert.ok(buffer.includes('#abcdef'), '#abcdef');
      done();
    });
  });

  it('should produce PNG badges', function(done) {
    const child = spawn('node', ['gh-badge.js', 'cactus', 'grown', '.png']);
    child.stdout.once('data', chunk => {
      assert.ok(isPng(chunk));
      done();
    });
  });
});
