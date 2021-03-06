'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var directiveReplace = require('gulp-directive-replace');
var wiredep = require('wiredep').stream;
var replace = require('gulp-replace');
var cdnizer = require('gulp-cdnizer');

var baseName = 'ctiColorPicker';
var jsSrc = baseName + '.js';
var cssSrc = baseName + '.css';

gulp.task('serve', ['bower', 'ccss', 'js', 'css'], function() {
  browserSync.init({
    server: {
      baseDir: './test_client',
      routes: {
        "/bower_components": "bower_components",
        "/dist": "dist",
        "/test_client": "test_client"
      }
    }
  });

  gulp.watch('./src/*.css', ['css']);
  gulp.watch(['./src/*.html', './src/*.js'], ['js']);
  gulp.watch('./test_client/client.css', ['ccss']);
  gulp.watch('./bower.json', ['bower']);
  gulp.watch([
    './src/*.html',
    './src/*.js',
    './test_client/*.html',
    './test_client/*.js'
  ]).on('change', browserSync.reload);
});

gulp.task('js', function() {
  return gulp.src('./src/' + jsSrc)
    .pipe(directiveReplace())
    .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() {
  return gulp.src('./src/'+cssSrc)
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

gulp.task('bower', function() {
  return gulp.src('./test_client/index.html')
    .pipe(wiredep({ ignorePath: '../' }))
    .pipe(gulp.dest('./test_client'));
});

gulp.task('ccss', function() {
  return gulp.src('./test_client/client.css')
    .pipe(autoprefixer())
    .pipe(gulp.dest('./test_client'))
    .pipe(browserSync.stream());
});

gulp.task('uglify', ['js'], function() {
  return gulp.src('./dist/'+jsSrc)
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['css'], function() {
  return gulp.src('./dist/'+cssSrc)
    .pipe(csso())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('demo', ['ccss'], function() {
  gulp.src('./test_client/app.js')
    .pipe(gulp.dest('./demo'));
  gulp.src('./test_client/client.css')
    .pipe(gulp.dest('./demo'));
  return gulp.src('./test_client/index.html')
    .pipe(replace('test_client', 'demo'))
    .pipe(cdnizer([
      'google:angular',
      {
        file: 'bower_components/hammerjs/hammer.js',
        cdn: '//hammerjs.github.io/dist/hammer.min.js'
      }
    ]))
    .pipe(gulp.dest('./demo'));
});

gulp.task('dist', ['uglify', 'minify', 'demo']);
gulp.task('default', ['serve']);
