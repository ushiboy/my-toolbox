var pkg = require('./package.json');
var distDir = pkg.dist;
var path = require('path');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var connect = require('connect');
var connectLivereload = require('connect-livereload');
var serveStatic = require('serve-static');

gulp.task('clean', del.bind(null, [distDir]));

gulp.task('html', () => {
  return gulp.src('app/**/*.html')
  .pipe(gulp.dest(distDir))
  .pipe($.livereload());
});

gulp.task('serve', () => {
  $.livereload.listen();
  connect()
  .use(connectLivereload())
  .use(serveStatic(path.join(__dirname, distDir)))
  .listen(3100);
});

gulp.task('dev', ['html', 'serve'], () => {
  gulp.watch('app/**/*.html', ['html']);
});

gulp.task('default', ['clean'], () => {
  gulp.start('dev');
});
