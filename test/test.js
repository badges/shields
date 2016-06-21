var assertion = require('assert');
var http = require('http');
var cproc = require('child_process');
var fs = require('fs');

function test(target, tests) {
  var wrappedTests = tests.map(function(test) {
    return function() {
      var desc = test[0];
      var f = test[1];
      return new Promise(function(resolve, reject) {
        var assert = function(pred, msg) { assert.ok(pred, msg); };
        ['ok', 'equal', 'deepEqual', 'strictEqual', 'deepStrictEqual',
        'notEqual', 'notDeepEqual', 'notStrictEqual', 'notDeepStrictEqual',
        'fail', 'doesNotThrow', 'throws',
        ].forEach(function(k) {
          assert[k] = function(...args) {
            try {
              assertion[k].apply(null, args);
            } catch(e) { reject(e); }
          };
        });
        f(resolve, assert);
      }).catch(function(e) {
        console.error('Failed:', target + ' ' + desc + '\n', e.stack);
      });
    };
  });
  var prom = wrappedTests[0]();
  for (var i = 1; i < wrappedTests.length; i++) {
    prom = prom.then(wrappedTests[i]);
  }
  return prom;
}

// Test parameters
var port = '1111';
var url = 'http://127.0.0.1:' + port + '/';
var server;

test('The CLI', [
  ['should provide a help message', function(done, assert) {
    var child = cproc.spawn('node', ['test/cli-test.js']);
    var buffer = '';
    child.stdout.on('data', function(chunk) {
      buffer += ''+chunk;
    });
    child.stdout.on('end', function() {
      assert(buffer.startsWith('Usage'));
      done();
    });
  }],
  ['should produce default badges', function(done, assert) {
    var child = cproc.spawn('node',
      ['test/cli-test.js', 'cactus', 'grown']);
    child.stdout.on('data', function(chunk) {
      var buffer = ''+chunk;
      assert(buffer.startsWith('<svg'), '<svg');
      assert(buffer.includes('cactus'), 'cactus');
      assert(buffer.includes('grown'), 'grown');
      done();
    });
  }],
  ['should produce colorschemed badges', function(done, assert) {
    child = cproc.spawn('node',
      ['test/cli-test.js', 'cactus', 'grown', ':green']);
    child.stdout.on('data', function(chunk) {
      var buffer = ''+chunk;
      assert(buffer.startsWith('<svg'), '<svg');
      done();
    });
  }],
  ['should produce right-color badges', function(done, assert) {
    child = cproc.spawn('node',
      ['test/cli-test.js', 'cactus', 'grown', '#abcdef']);
    child.stdout.on('data', function(chunk) {
      var buffer = ''+chunk;
      assert(buffer.includes('#abcdef'), '#abcdef')
      done();
    });
  }],
  ['should produce PNG badges', function(done, assert) {
    child = cproc.spawn('node',
      ['test/cli-test.js', 'cactus', 'grown', '.png']);
    child.stdout.on('data', function(chunk) {
      // Check the PNG magic number.
      assert.equal(chunk[0], 0x89);
      assert.equal(chunk[1], 0x50);
      assert.equal(chunk[2], 0x4e);
      assert.equal(chunk[3], 0x47);
      assert.equal(chunk[4], 0x0d);
      assert.equal(chunk[5], 0x0a);
      assert.equal(chunk[6], 0x1a);
      assert.equal(chunk[7], 0x0a);
      done();
    });
  }],
])

.then(function() {
test('The server', [
  // Start running the server.
  ['should start', function(done, assert) {
    server = cproc.spawn('node', ['test/server-test.js', port]);
    var isDone = false;
    server.stdout.on('data', function(data) {
      if (data.toString().indexOf('ready') >= 0 && !isDone) { done(); isDone = true; }
    });
    server.stderr.on('data', function(data) { console.log(''+data); });
  }],
  ['should produce colorscheme badges', function(done, assert) {
    http.get(url + ':fruit-apple-green.svg',
      function(res) {
        var buffer = '';
        res.on('data', function(chunk) { buffer += ''+chunk; });
        res.on('end', function() {
          assert(buffer.startsWith('<svg'), '<svg');
          assert(buffer.includes('fruit'), 'fruit');
          assert(buffer.includes('apple'), 'apple');
          done();
        });
    });
  }],
  ['should produce colorscheme PNG badges', function(done, assert) {
    http.get(url + ':fruit-apple-green.png',
      function(res) {
        res.on('data', function(chunk) {
          // Check the PNG magic number.
          assert.equal(chunk[0], 0x89);
          assert.equal(chunk[1], 0x50);
          assert.equal(chunk[2], 0x4e);
          assert.equal(chunk[3], 0x47);
          assert.equal(chunk[4], 0x0d);
          assert.equal(chunk[5], 0x0a);
          assert.equal(chunk[6], 0x1a);
          assert.equal(chunk[7], 0x0a);
          done();
        });
    });
  }],
  ['should shut down', function(done, assert) {
    server.kill();
    server.on('exit', function() { done(); });
  }],
])});
