var pkg = require('./package.json');
var distDir = pkg.dist;
var path = require('path');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var connect = require('connect');
var connectLivereload = require('connect-livereload');
var serveStatic = require('serve-static');
var webpack = require('webpack');
var bundler = webpack(require('./webpack.config.js'));
var proxyMiddleware = require('http-proxy-middleware');

function less() {
  return gulp.src('app/styles/**/*.less')
  .pipe($.less({
    paths: [
      'node_modules/bootstrap/less'
    ]
  }));
}

gulp.task('clean', del.bind(null, [distDir]));

gulp.task('html', () => {
  return gulp.src('app/**/*.html')
  .pipe(gulp.dest(distDir))
  .pipe($.livereload());
});

gulp.task('styles:dev', ['less:dev', 'fonts', 'images']);

gulp.task('styles:prod', ['less:prod', 'fonts', 'images']);

gulp.task('less:dev', () => {
  return less()
  .pipe(gulp.dest(path.join(distDir, 'styles')))
  .pipe($.livereload());
});

gulp.task('less:prod', () => {
  return less()
  .pipe($.minifyCss())
  .pipe(gulp.dest(path.join(distDir, 'styles')))
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

gulp.task('bundle:dev', cb => {
  bundler.run((err, stats) => {
    if (err) {
      throw new $.util.PluginError('webpack:build', err);
    }
    $.util.log('[webpack:build]', stats.toString({
      colors: true,
      chunkModules: false
    }));
    cb();
    $.livereload.reload();
  });
});

gulp.task('bundle:prod', cb => {
  webpack(require('./webpack.production.config.js'), cb);
});

gulp.task('serve', () => {
  var port = process.env.API_PORT || 3000;

  $.livereload.listen();
  connect()
  .use(connectLivereload())
  .use(serveStatic(path.join(__dirname, distDir)))
  .use(proxyMiddleware([
    '/api'
  ], {
    target: 'http://localhost:' + port,
    changeOrigin: true
  }))
  .listen(3100);
});

gulp.task('dev', ['html', 'styles:dev', 'bundle:dev', 'serve'], () => {
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('app/styles/**/*.less', ['less:dev']);
  gulp.watch('app/scripts/**/*.js', ['bundle:dev']);
});

gulp.task('prod', ['html', 'styles:prod', 'bundle:prod'], () => {
  return gulp.src(path.join(__dirname, distDir, '**/*'))
  .pipe($.zip(pkg.name + '.zip'))
  .pipe(gulp.dest('build'));
});

gulp.task('build', ['clean'], () => {
  gulp.start('prod');
});

gulp.task('default', ['clean'], () => {
  gulp.start('dev');
});
