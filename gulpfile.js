var gulp = require('gulp');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');


// 语法检查
gulp.task('jshint', function () {
    return gulp.src( 'src/*.js' )
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 清空文件夹
gulp.task('clean', function(){
  return gulp.src('build/', {read: false})
      .pipe(clean());
})

// js压缩代码
gulp.task('jsmin', function () {
  return gulp.src( 'src/fastpl.js' )
      .pipe(sourcemaps.init())
      .pipe(uglify({
        preserveComments: 'some'
      }))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(sourcemaps.write('/'))
      .pipe(gulp.dest('build'));
});
gulp.task('jsplus', function () {
  return gulp.src( ['src/fastpl.js', 'src/plus.js'] )
      .pipe(concat('fastpl-plus.js'))
      .pipe(sourcemaps.init())
      .pipe(uglify({
        preserveComments: 'some'
      }))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(sourcemaps.write('/'))
      .pipe(gulp.dest('build'));
});
gulp.task('js', ['clean'], function () {
  gulp.start('jsmin', 'jsplus');
});

// 监视文件的变化
gulp.task('watch', function () {
    gulp.watch('src/*.js', ['jshint', 'js']);
});