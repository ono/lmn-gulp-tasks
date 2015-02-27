'use strict';

var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var getLmnTask = require('../');
var vfsFake = require('vinyl-fs-fake');

gulp.src = vfsFake.src;
gulp.dest = vfsFake.dest;

// Throw them for should.js
getLmnTask.setErrorHandler(function (err) {
  throw err;
});

global.getFile = function getFile(name, slice) {
  var buffer = fs.readFileSync(name);

  if (slice !== false) {
    buffer = buffer.slice(0, -1);
  }

  return buffer;
};

global.clean = function clean() {
  del('test/fixtures/out');
};

// Waiting on Papercloud/nodejs-hook-stdio#1
function hookStdout(callback) {
  var old_write = process.stdout.write;

  process.stdout.write = function (string, encoding, fd) {
    callback(string, encoding, fd);
  };

  return function () {
    process.stdout.write = old_write;
  };
}

global.hookOnce = function hookOnce(callback) {
  var unhook = hookStdout(function (string, encoding, fd) {
    unhook();

    callback(string, encoding, fd);
  });
};