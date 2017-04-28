var assert = require('assert');
var cproc = require('child_process');
var isPng = require('is-png');
var isSvg = require('is-svg');

describe('The CLI', function () {

  it('should provide a help message', function(done) {
    var child = cproc.spawn('node', ['gh-badge.js']);
    var buffer = '';
    child.stdout.on('data', function(chunk) {
      buffer += ''+chunk;
    });
    child.stdout.on('end', function() {
      assert(buffer.startsWith('Usage'));
      done();
    });
  });

  it('should produce default badges', function(done) {
    var child = cproc.spawn('node',
      ['gh-badge.js', 'cactus', 'grown']);
    child.stdout.once('data', function(chunk) {
      var buffer = ''+chunk;
      assert.ok(isSvg(buffer));
      assert(buffer.includes('cactus'), 'cactus');
      assert(buffer.includes('grown'), 'grown');
      done();
    });
  });

  it('should produce colorschemed badges', function(done) {
    var child = cproc.spawn('node',
      ['gh-badge.js', 'cactus', 'grown', ':green']);
    child.stdout.once('data', function(chunk) {
      var buffer = ''+chunk;
      assert.ok(isSvg(buffer));
      done();
    });
  });

  it('should produce right-color badges', function(done) {
    var child = cproc.spawn('node',
      ['gh-badge.js', 'cactus', 'grown', '#abcdef']);
    child.stdout.once('data', function(chunk) {
      var buffer = ''+chunk;
      assert(buffer.includes('#abcdef'), '#abcdef');
      done();
    });
  });

  it('should produce PNG badges', function(done) {
    var child = cproc.spawn('node',
      ['gh-badge.js', 'cactus', 'grown', '.png']);
    child.stdout.once('data', function(chunk) {
      assert.ok(isPng(chunk));
      done();
    });
  });

});
