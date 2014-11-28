var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-minify-css');
var rename = require('gulp-rename');
var rev = require('gulp-rev');

//var gifsicle = require('imagemin-gifsicle');
//var pngcrush = require('imagemin-pngcrush')

// 语法检查
gulp.task('jshint', function () {
    return gulp.src('dialog.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

var options = {
    preserveComments: 'some'
};
// js压缩代码
gulp.task('script', function (){
     return gulp.src('src/*.js')
          // .pipe(concat('all.js'))
          // .pipe(gulp.dest('dist'))
          .pipe(uglify(options))
          .pipe(rename({
            suffix: "-min"
          }))
          .pipe(gulp.dest('build'));
});

// css压缩代码
gulp.task('css', function (){
     return gulp.src('src/css/*.css')
          // .pipe(concat('all.js'))
          // .pipe(gulp.dest('dist'))
          .pipe(cssmin({
            keepSpecialComments: 1
          }))
          .pipe(rename({
            suffix: "-min"
          }))
          .pipe(gulp.dest('build/css/'));
});

// images压缩代码
gulp.task('image', function (){
     return gulp.src('src/images/*.gif')
          // .pipe(concat('all.js'))
          // .pipe(gulp.dest('dist'))
          .pipe(gifsicle({
            interlaced: true
          }))
          // .pipe(rename({
          //   suffix: "-min"
          // }))
          .pipe(gulp.dest('build/images/'));
});

// 修改文件名
gulp.task('rev', function () {
    return gulp.src('src/*.js')
          .pipe( rev() )
          .pipe( gulp.dest('build') );
});

// 监视文件的变化
gulp.task('watch', function () {
    gulp.watch('src/*.js', ['jshint', 'minify']);
});

// 压缩代码
gulp.task('minify', ['script', 'css' ] );

// 注册缺省任务
gulp.task('default', ['jshint', 'minify', 'watch']);

// 可以看出，基本上所有的任务体都是这么个模式：
// gulp.task('任务名称', function () {
//     return gulp.src('文件')
//         .pipe(...)
//         .pipe(...)
//         // 直到任务的最后一步
//         .pipe(...);
// });