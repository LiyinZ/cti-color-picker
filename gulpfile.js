'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var directiveReplace = require('gulp-directive-replace');
var wiredep = require('wiredep').stream;

var baseName = 'ctiColorPicker';
var jsSrc = baseName + '.js';
var cssSrc = baseName + '.css';
var tmpPath = './.tmp';

gulp.task('serve', ['tmpjs', 'bower', 'ccss', 'js', 'css'], function() {
  browserSync.init({
    server: {
      baseDir: './.tmp',
      routes: {
        "/bower_components": "bower_components",
        "/dist": "dist"
      }
    }
  });

  gulp.watch('./src/*.css', ['css']);
  gulp.watch(['./src/*.html', './src/*.js'], ['js']);
  gulp.watch('./test_client/client.css', ['ccss']);
  gulp.watch('./test_client/index.html', ['bower']);
  gulp.watch('./test_client/app.js', ['tmpjs']);
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

gulp.task('tmpjs', function() {
  return gulp.src('./test_client/*.js')
    .pipe(gulp.dest(tmpPath));
});

gulp.task('bower', function() {
  return gulp.src('./test_client/index.html')
    .pipe(wiredep())
    .pipe(gulp.dest(tmpPath));
});

gulp.task('ccss', function() {
  return gulp.src('./test_client/client.css')
    .pipe(autoprefixer())
    .pipe(gulp.dest('./test_client'))
    .pipe(gulp.dest(tmpPath))
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

gulp.task('dist', ['uglify', 'minify']);
gulp.task('default', ['serve']);
