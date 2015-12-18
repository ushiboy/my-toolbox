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

gulp.task('styles:dev', ['less:dev', 'fonts', 'images']);

gulp.task('less:dev', () => {
  return gulp.src('app/styles/**/*.less')
  .pipe($.less({
    paths: [
      'node_modules/bootstrap/less'
    ]
  }))
  .pipe(gulp.dest(path.join(distDir, 'styles')))
  .pipe($.livereload());
});

gulp.task('fonts', () => {
  return gulp.src([
    'node_modules/bootstrap/fonts/*'
  ])
  .pipe(gulp.dest(path.join(distDir, 'fonts')));
});

gulp.task('images', () => {
  return gulp.src([
    'app/images/**/*'
  ])
  .pipe(gulp.dest(path.join(distDir, 'images')));
});

gulp.task('serve', () => {
  $.livereload.listen();
  connect()
  .use(connectLivereload())
  .use(serveStatic(path.join(__dirname, distDir)))
  .listen(3100);
});

gulp.task('dev', ['html', 'styles:dev', 'serve'], () => {
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('app/styles/**/*.less', ['less:dev']);
});

gulp.task('default', ['clean'], () => {
  gulp.start('dev');
});
