var pkg = require('./package.json');
var distDir = pkg.dist;
var path = require('path');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

gulp.task('clean', del.bind(null, [distDir]));

gulp.task('dev', [], () => {

});

gulp.task('default', ['clean'], () => {
  gulp.start('dev');
});
