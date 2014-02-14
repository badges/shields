var ass = require('ass').enable();
var should = require('should');

var http = require('http');
var cproc = require('child_process');
var fs = require('fs');

describe('the CLI', function() {
  it('should provide a help message', function(done) {
    var child = cproc.spawn('node', ['ass-stubs/cli-test.js']);
    var buffer = '';
    child.stdout.on('data', function(chunk) {
      buffer += ''+chunk;
    });
    child.stdout.on('end', function() {
      buffer.should.startWith('Usage');
      done();
    });
  });
  it('should produce default badges', function(done) {
    var child = cproc.spawn('node',
      ['ass-stubs/cli-test.js', 'cactus', 'grown']);
    child.stdout.on('data', function(chunk) {
      var buffer = ''+chunk;
      buffer.should.startWith('<svg');
      buffer.should.containEql('cactus');
      buffer.should.containEql('grown');
      done();
    });
  });
  it('should produce colorschemed badges', function(done) {
    child = cproc.spawn('node',
      ['ass-stubs/cli-test.js', 'cactus', 'grown', ':green']);
    child.stdout.on('data', function(chunk) {
      var buffer = ''+chunk;
      buffer.should.startWith('<svg');
      done();
    });
  });
  it('should produce right-color badges', function(done) {
    child = cproc.spawn('node',
      ['ass-stubs/cli-test.js', 'cactus', 'grown', '#abcdef']);
    child.stdout.on('data', function(chunk) {
      var buffer = ''+chunk;
      buffer.should.containEql('#abcdef');
      done();
    });
  });
  it('should produce PNG badges', function(done) {
    child = cproc.spawn('node',
      ['ass-stubs/cli-test.js', 'cactus', 'grown', '.png']);
    child.stdout.on('data', function(chunk) {
      // Check the PNG magic number.
      chunk[0].should.equal(0x89);
      chunk[1].should.equal(0x50);
      chunk[2].should.equal(0x4e);
      chunk[3].should.equal(0x47);
      chunk[4].should.equal(0x0d);
      chunk[5].should.equal(0x0a);
      chunk[6].should.equal(0x1a);
      chunk[7].should.equal(0x0a);
      done();
    });
  });
});

describe('the server', function() {
  var port = '1111';
  var url = 'http://127.0.0.1:' + port + '/';
  var server;

  // Start running the server.
  it('should start', function(done) {
    server = cproc.spawn('node', ['ass-stubs/server-test.js', port]);
    server.stdout.on('data', function(data) { done(); });
    server.stderr.on('data', function(data) { console.log(''+data); });
  });

  it('should produce colorscheme badges', function(done) {
    http.get(url + ':fruit-apple-green.svg',
      function(res) {
        var buffer = '';
        res.on('data', function(chunk) { buffer += ''+chunk; });
        res.on('end', function() {
          buffer.should.startWith('<svg');
          buffer.should.containEql('fruit');
          buffer.should.containEql('apple');
          done();
        });
    });
  });

  it('should produce colorscheme PNG badges', function(done) {
    http.get(url + ':fruit-apple-green.png',
      function(res) {
        res.on('data', function(chunk) {
          // Check the PNG magic number.
          chunk[0].should.equal(0x89);
          chunk[1].should.equal(0x50);
          chunk[2].should.equal(0x4e);
          chunk[3].should.equal(0x47);
          chunk[4].should.equal(0x0d);
          chunk[5].should.equal(0x0a);
          chunk[6].should.equal(0x1a);
          chunk[7].should.equal(0x0a);
          done();
        });
    });
  });

  it('should shut down', function(done) {
    server.kill();
    server.on('exit', function() { done(); });
  });

});

describe('the ass wrap-up', function() {
  it('should write coverage', function(done) {
    ass.report('html', function(err, r) {
      fs.writeFileSync('coverage.html', r);
      done();
    });
  });
  it('should write the coverage image', function(done) {
    ass.report('json', function(err, r) {
      if (!!err) { return done(err); }
      var badge = require('./badge.js');
      var score = +r.percent;
      var badgeData = {text:['coverage', score + '%']};
      if (score < 70) {
        badgeData.colorscheme = 'red';
      } else if (score < 80) {
        badgeData.colorscheme = 'yellow';
      } else if (score < 90) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (score < 100) {
        badgeData.colorscheme = 'green';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      badge(badgeData, function writeBadge(svg) {
        fs.writeFileSync('./coverage.svg', svg);
        done();
      });
    });
  });
});
