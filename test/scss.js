'use strict';

var loadLmnTask = require('../');

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var fixtures = path.join(__dirname, 'fixtures/sass');

function getFile(name, slice) {
  var buffer = fs.readFileSync(path.join(fixtures, name));

  if (slice !== false) {
    buffer = buffer.slice(0, -1);
  }

  return buffer;
}


describe('scss', function () {
  it('should parse simple scss', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'test.scss'),
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.should.eql(getFile('test-out.min.css'));

        done();
      }
    })();
  });

  it('should parse simple sass'); // gulp-sass is broken

  //it('should parse simple sass', function (done) {
  //  loadLmnTask('scss', {
  //    src: path.join(fixtures, 'test.sass'),
  //    dest: function (files) {
  //      files.length.should.equal(1);
  //
  //      files[0].contents.should.eql(getFile('test-out.min.css'));
  //
  //      done();
  //    }
  //  })();
  //});

  it('should parse simple scss with minify false', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'test.scss'),
      minify: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.should.eql(getFile('test-out.css', false));

        done();
      }
    })();
  });

  it('should handle node_modules imports', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import.scss'),
      minify: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.length.should.be.above(1000);

        done();
      }
    })();
  });

  it('should handle other import paths', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import2.scss'),
      minify: false,
      includePaths: ['test/fixtures'],
      dest: function (files) {
        files.length.should.equal(1);

        done();
      }
    })();
  });

  it('should handle node_modules imports even when other import paths', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import.scss'),
      minify: false,
      includePaths: ['something'],
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.length.should.be.above(1000);

        done();
      }
    })();
  });

  it('should not handle node_modules imports when told not to', function (done) {
    var doneOnce = _.once(done);
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import.scss'),
      minify: false,
      includePaths: false,
      dest: function (files) {
        files.length.should.equal(0);
      },
      onError: function (err) {
        err.message.should.containEql('file to import not found or unreadable');
        doneOnce();
      }
    })();
  });

  it('should be autoprefixed', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'prefix.scss'),
      minify: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.toString('utf8').should.containEql('-ms');

        done();
      }
    })();
  });

  it('should check for "../node_modules"', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'bad-import.scss'),
      minify: false,
      dest: function (files) {
        files.length.should.equal(0);
      },
      onError: function () {
        done();
      }
    })();
  });

  it('…unless you skip it', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'bad-import.scss'),
      minify: false,
      ignoreSuckyAntipattern: true,
      dest: function (files) {
        files.length.should.equal(1);
        done();
      }
    })();
  });
});
