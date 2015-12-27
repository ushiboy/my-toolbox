# My Toolbox

### 下準備

プロジェクトのルートディレクトリで下準備。npm initでpackage.json作って、Node用の.gitignore設定を作る。

.gitignore設定は[gibo](https://github.com/simonwhitaker/gibo)を使って作ってる。

```
$ mkdir project
$ cd project
$ npm init
$ gibo Node | tee .gitignore
```

### ツールチェインのベースにするタスクランナー

タスクランナーは[gulp](http://gulpjs.com/)の3.9系を使ってる。
gulpコマンドはプロジェクト配下にインストールしたものをnpmのコマンド経由で使う。

後々追加することになるgulpのプラグインはgulp-load-pluginsでまとめてロードできるようにしておく。

HTMLやCSS、JavaScriptなどの編集するファイルはappディレクトリ配下に置いて行き、
各種ツールを通してビルド済みのディレクトリ（dist）に配備されるようにする。

ビルド済みディレクトリはpackage.jsonに設定として書いておき、gulpfile.jsで参照して使う。

```
.
├── app
├── dist
├── gulpfile.js
├── node_modules
└── package.json
```


インストール
```
$ npm install --save-dev gulp gulp-load-plugins del
```

gulpの設定を作る。ベースで使うタスクは次の通り。

| タスク名 | 用途 |
|:-|:-|
| clean | ビルド済みディレクトリを削除する |
| dev | 開発環境を起動する |
| default | デフォルト（cleanしてdevを実行する）|

gulpfile.js
```javascript
var path = require('path');
var pkg = require('./package.json');
var distDir = path.join(__dirname, pkg.dist);
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

gulp.task('clean', del.bind(null, [distDir]));

gulp.task('dev', [], () => {

});

gulp.task('default', ['clean'], () => {
  gulp.start('dev');
});
```

package.jsonにgulpコマンドとビルド済みディレクトリの設定を追加する。

package.json
```json
-- 中略 --
  "dist": "dist",
  "scripts": {
    "gulp": "gulp"
  },
-- 中略 --
```

.gitignoreにビルド済みディレクトリを追加。

.gitignore
```
dist
-- 中略 --
```

これでgulpはこんな感じに使う。

```
$ npm run gulp
```


### HTMLと開発用Webサーバ

開発時にブラウザで確認するためのWebサーバは[connect](https://github.com/senchalabs/connect)を使っている。

Webサーバはビルド済みディレクトリをドキュメントルートとして動作させる。
gulpのwatchでファイル監視して、変更があったら必要なビルドをしてLiveReloadでブラウザを更新させる。

[BrowserSync](https://www.browsersync.io/)をしばらく使っていたけど、
connectで十分な機能しか使ってなかったのでconnectに戻した。

インストール
```
$ npm install --save-dev connect connect-livereload serve-static gulp-livereload
```

HTMLファイルをappディレクトリに追加する。

app/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World!</title>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

gulpにhtmlとserveタスクを追加して、devタスクを修正する。


| タスク名 | 用途 |
|:-|:-|
| html | HTMLファイルをビルド済みディレクトリへ配備する |
| serve | 開発用Webサーバを起動する |
| dev | 開発環境を起動し、HTMLファイルを監視する |

gulpfile.js
```javascript
-- 中略 --
var connect = require('connect');
var connectLivereload = require('connect-livereload');
var serveStatic = require('serve-static');
-- 中略 --
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
  .pipe(gulp.dest(distDir))
  .pipe($.livereload());
});

gulp.task('serve', () => {
  $.livereload.listen();
  connect()
  .use(connectLivereload())
  .use(serveStatic(distDir))
  .listen(3100);
});

gulp.task('dev', ['html', 'serve'], () => {
  gulp.watch('app/**/*.html', ['html']);
});
-- 中略 --
```

これでgulpを起動すると開発用Webサーバを立ち上げてブラウザで確認できるようになる。

```
$ npm run gulp
```

### CSSや画像ファイルなどのstyleまわり

CSSは[Bootstrap](http://getbootstrap.com/)をベースに[less](http://less-ja.studiomohawk.com/)で書いて、
[gulp-less](https://github.com/plus3network/gulp-less)でビルドしている。

インストール
```
$ npm install --save bootstrap
$ npm install --save-dev gulp-less
```

app/styles/app.lessとしてアプリ用のstyleとしている。
importでbootstrapのlessを読ませて、あとは必要なstyleを書いていく。

Reactみたいなコンポーネント作って行く系のを使ってると、
コンポーネントごとにlessファイル作って管理とかしたほうがいいのかなーと思うけど、
Bootstrapに毛の生えた程度にしかstyle追加してないのでapp.lessだけで今のところは済んでいる。

app/styles/app.less
```less
@import '../../node_modules/bootstrap/less/bootstrap.less';

body {
  background-color: #efffef;
}
```

htmlにcssの読み込みを追加。

app/index.html
```html
-- 中略 --
<head>
  <meta charset="UTF-8">
  <title>Hello World!</title>
  <link rel="stylesheet" href="./styles/app.css" />
</head>
-- 中略 --
```

gulpにstyle周りのタスクを追加して、devタスクを修正する。

| タスク名 | 用途 |
|:-|:-|
| styles:dev | 開発環境用styleビルド（less:dev、fonts、imagesを実行する） |
| less:dev | lessファイルをビルドする |
| fonts | フォントリソースをビルド済みディレクトリへ配備する |
| images | 画像リソースをビルド済みディレクトリへ配備する |
| dev | 開発環境を起動し、HTMLファイル、lessファイルを監視する |

gulpfile.js
```javascript
-- 中略 --
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
-- 中略 --
gulp.task('dev', ['html', 'styles:dev', 'serve'], () => {
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('app/styles/**/*.less', ['less:dev']);
});
-- 中略 --
```

### JavaScriptまわり

[Babel](https://babeljs.io/)を使ってES6で書いたコードをES5にトランスパイルしてる。
モジュールバンドラには[webpack](https://webpack.github.io/)を使っている。

webpackは多機能だけど、あくまでJavaScriptのモジュールバンドラとして使っているので、
必要に応じて[browserify](http://browserify.org/)に差し替えたりしている。
実際、[Electron](http://electron.atom.io/)でアプリ作っていた時に、
webpackでうまくやれなくてbrowserifyに変えたらさくっとできた、みたいなことがあった。


インストール
```
$ npm install --save-dev webpack babel-loader babel-preset-es2015 gulp-util
```

Babelの設定は.babelrcに書く。

.babelrc
```json
{
  "presets": ["es2015"]
}
```

開発環境用のwebpack設定を作る。
エントリポイントのapp.jsを起点に必要なファイルを読み込んで、
Babelを通してソースマップ付きでビルド済みディレクトリに配備する。

webpack.config.js
```javascript
var path = require('path');
var pkg = require('./package.json');
var distDir = path.join(__dirname, pkg.dist);

module.exports = {
  entry: {
    app: './app/scripts/app.js'
  },
  output: {
    path: path.join(distDir, 'scripts'),
    filename: '[name].js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
};
```

gulpにbundle:devタスクを追加する。devタスクを修正する。

| タスク名 | 用途 |
|:-|:-|
| bundle:dev | JavaScriptの開発用ビルドを行う |
| dev | 開発環境を起動し、HTMLファイル、lessファイル、JavaScriptファイルを監視する |

gulpfile.js
```javascript
-- 中略 --
var webpack = require('webpack');
var bundler = webpack(require('./webpack.config.js'));
-- 中略 --
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
-- 中略 --
gulp.task('dev', ['html', 'styles:dev', 'bundle:dev', 'serve'], () => {
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('app/styles/**/*.less', ['less:dev']);
  gulp.watch('app/scripts/**/*.js', ['bundle:dev']);
});
-- 中略 --
```

JavaScriptソースコードはapp/scripts配下に置いて行く。

app/scripts/Hoge.js
```javascript
export default class Hoge {

  constructor(name) {
    this._name = name;
  }

  greet() {
    return `Hello! ${this._name}`;
  }
}
```

app.jsをエントリポイントとして、HTMLファイルに読み込ませる。

app/scripts/app.js
```javascript
import Hoge from './Hoge';

const hoge = new Hoge('test');

console.log(hoge.greet());
```

app/index.html
```html
-- 中略 --
<body>
  <h1>Hello World!</h1>
  <script src="./scripts/app.js"></script>
</body>
</html>
```

### プロダクション用のビルド

開発用のビルド設定とは別にプロダクション用ビルド設定（ソースマップなし、ミニファイ化）も作っておく。
ビルド済みリソースはzipで固めて、フロントエンドの開発を直接しない人に配れるようにしておく。

インストール
```
$ npm install --save-dev gulp-zip gulp-minify-css
```

gulpにプロダクション用ビルドタスクを追加する。

less:devとless:prodの共通部分をless関数として切り出して、それぞれのタスクに利用する。
webpackのプロダクションビルド用設定を追加してbundle:prodではそちらを使うようにする。

| タスク名 | 用途 |
|:-|:-|
| styles:prod | プロダクション環境用のstyleビルド（less:prod、fonts、imagesを実行する） |
| less:prod | lessファイルのプロダクション用ビルドを行う |
| bundle:prod | JavaScriptのプロダクション用ビルドを行う |
| prod | プロダクションビルドを起動する |
| build | プロダクションビルド（cleanしてprodする） |

gulpfile.js
```javascript
-- 中略 --
function less() {
  return gulp.src('app/styles/**/*.less')
  .pipe($.less({
    paths: [
      'node_modules/bootstrap/less'
    ]
  }));
}
-- 中略 --
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
-- 中略 --
gulp.task('bundle:prod', cb => {
  webpack(require('./webpack.production.config.js'), cb);
});
-- 中略 --
gulp.task('prod', ['html', 'styles:prod', 'bundle:prod'], () => {
  return gulp.src(path.join(distDir, '**/*'))
  .pipe($.zip(pkg.name + '.zip'))
  .pipe(gulp.dest('build'));
});

gulp.task('build', ['clean'], () => {
  gulp.start('prod');
});
-- 中略 --
```

webpackの設定を開発用とプロダクション用で分離する。両方の共通部分をcommon設定ファイルとして取り出す。

webpack.common.js
```javascript
var path = require('path');
var pkg = require('./package.json');
var distDir = path.join(__dirname, pkg.dist);

module.exports = function() {
  return {
    entry: {
      app: './app/scripts/app.js'
    },
    output: {
      path: path.join(distDir, 'scripts'),
      filename: '[name].js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel'
        }
      ]
    }
  };
};
```

開発用のwebpack設定は、共通設定を読み込んでソースマップを追加した設定にする。

webpack.config.js
```javascript
var config = require('./webpack.common.js')();
config.devtool = 'inline-source-map';

module.exports = config;
```

プロダクション用のwebpack設定は、共通設定を読み込んでUglifyプラグインを追加した設定にする。

webpack.production.config.js
```javascript
var config = require('./webpack.common.js')();
var webpack = require('webpack');
config.plugins = [
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
];

module.exports = config;
```

buildディレクトリはgitignore対象にする。

.gitignore
```
dist
build
-- 中略 --
```

ビルド用コマンドをpackage.jsonに追加する。

package.json
```json
-- 中略 --
  "scripts": {
    "gulp": "gulp",
    "build": "gulp build"
  },
-- 中略 --
```

プロダクション用ビルドはこんな感じでコマンドを叩いて行う。
```
$ npm run build
```

### テスト環境

テストはmochaとpower-assertで書いている。
テストコードもES6で書きたいのでewpower-babel使っている。

インストール
```
$ npm install --save-dev mocha power-assert espower-babel
```

mochaの設定を入れておく。

test/mocha.opts
```
--compilers js:espower-babel/guess
```

テストコードはこんな感じ。

test/Hoge-test.js
```javascript
import Hoge from '../app/scripts/Hoge';
import assert from 'power-assert';

describe('Hoge', () => {

  const name = 'Test';
  let hoge;
  beforeEach(() => {
    hoge = new Hoge(name);
  });

  describe('#greet', () => {
    it('returns greet message', () => {
      assert(hoge.greet() === `Hello! ${name}`);
    });
  });

});
```

テストを叩くためのnpmコマンドをpackage.jsonに追加する。

package.json
```json
-- 中略 --
  "scripts": {
    "gulp": "gulp",
    "build": "gulp build",
    "mocha": "mocha",
    "test": "mocha test/*-test.js"
  },
-- 中略 --
```

テスト叩くときはこんな感じで一気に。vimで編集のファイルとか個別に叩くときはnpm run mochaで。
```
$ npm test
```

### APIサーバとつなぎながら開発

AjaxでバックエンドのAPIを使う場合、可能であればバックエンドのサーバを起動しておいて、
[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)を使ってAPIへのリクエストだけリバースプロキシする。


インストール
```
$ npm install --save-dev http-proxy-middleware
```

gulpのserveタスクに修正を加える。
下の設定例だと/apiなパスへのリクエストはlocalhostの3000ポートの方へプロキシされる。

gulefile.js
```javascript
-- 中略 --
var proxyMiddleware = require('http-proxy-middleware');
-- 中略 --
gulp.task('serve', () => {
  var port = process.env.API_PORT || 3000;

  $.livereload.listen();
  connect()
  .use(connectLivereload())
  .use(serveStatic(distDir))
  .use(proxyMiddleware([
    '/api'
  ], {
    target: 'http://localhost:' + port,
    changeOrigin: true
  }))
  .listen(3100);
});
-- 中略 --
```

fetchを使ってAPIを叩くサンプルで書くとこんな感じ。

app/scripts/Hoge.js
```javascript
export default class Hoge {

  constructor(name) {
    this._name = name;
  }

  greet() {
    return `Hello! ${this._name}`;
  }

  fetchGreet() {
    return fetch('/api/greeting')
    .then(res => res.json())
    .then(json => {
      return `${json.message} ${this._name}`;
    });
  }
}
```

app/scripts/app.js
```javascript
import Hoge from './Hoge';

const hoge = new Hoge('test');

console.log(hoge.greet());

hoge.fetchGreet()
.then(message => {
  console.log(message);
});
```


##### 補足：バックエンドサーバのAPIをモック

バックエンドサーバのAPI仕様が[JSON Hyper-Schema](http://json-schema.org/)で定義されている場合
（下のfixture/api.jsonみたいな感じ）、雑にモックサーバを起動して代替にしている。

fixture/api.json
```json
{
  "$schema": "http://interagent.github.io/interagent-hyper-schema",
  "type": [
    "object"
  ],
  "definitions": {
    "greeting": {
      "$schema": "http://json-schema.org/draft-04/hyper-schema",
      "title": "Greeting",
      "description": "ご挨拶API",
      "stability": "prototype",
      "strictProperties": true,
      "type": [
        "object"
      ],
      "definitions": {
        "message": {
          "description": "ご挨拶メッセージ",
          "example": "こんにちは",
          "type": [
            "string"
          ]
        }
      },
      "links": [
        {
          "description": "ご挨拶メッセージを取得する",
          "href": "/api/greeting",
          "method": "GET",
          "rel": "self",
          "title": "Info"
        }
      ],
      "properties": {
        "message": {
          "$ref": "#/definitions/greeting/definitions/message"
        }
      }
    }
  },
  "properties": {
    "greeting": {
      "$ref": "#/definitions/greeting"
    }
  }
}
```

インストール
```
$ npm install --save-dev json-schema-mockserve
```

gulpのserveタスクを修正する。
環境変数MOCKに値が設定された場合、モックサーバを起動するようにしている。

gulpfile.js
```javascript
-- 中略 --
var MockServe = require('json-schema-mockserve').MockServe;
-- 中略 --
gulp.task('serve', () => {
  var port = process.env.API_PORT || 3000;

  if (process.env.MOCK) {
    new MockServe({
      port: port,
      path: path.join(__dirname, 'fixture', 'api.json')
    }).start();
  }

  $.livereload.listen();
  connect()
  .use(connectLivereload())
  .use(serveStatic(distDir))
  .use(proxyMiddleware([
    '/api'
  ], {
    target: 'http://localhost:' + port,
    changeOrigin: true
  }))
  .listen(3100);
});
-- 中略 --
```

モックサーバで起動するコマンドをpackage.jsonに追加する。

package.json
```json
-- 中略 --
  "scripts": {
    "gulp": "gulp",
    "gulp:mock": "MOCK=ON gulp",
    "build": "gulp build",
    "mocha": "mocha",
    "test": "mocha test/*-test.js"
  },
-- 中略 --
```

こんな感じで起動する。
```
$ npm run gulp:mock
```

### ブラウザでテスト

Nodeの環境だけでなくブラウザ環境でもテストする場合は[testem](https://github.com/testem/testem)を使う。

webpackでJavaScriptコードをブラウザ用にビルドしてtestemに読ませてる。
このとき、power-assertとwebpackでjsonの読み込みを可能にしておかないと、
ビルド後のコードが動かないのでjson-loaderを追加しておく。

インストール
```
$ npm install --save-dev testem glob json-loader
```

テスト用のwebpack設定を追加する。
testディレクトリ配下のテスト用コードをglobでごそっと集めて変換する。

webpack.test.config.js
```javascript
var path = require('path');
var glob = require('glob');

module.exports = {
  entry: {
    test: glob.sync(path.join(__dirname, 'test/**/*-test.js'))
  },
  output: {
    path: path.join(__dirname, '.powered-assert'),
    filename: '[name].js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
};
```

testemの設定をtestem.jsonに行う。
実行前にwebpackでテスト用ビルドを行い、実行後にテスト用ビルドディレクトリ（.powered-assert）ごと破棄する。

testem.json
```json
{
  "framework": "mocha",
  "before_tests": "webpack --config webpack.test.config.js",
  "on_exit": "rm -rf .powered-assert/",
  "src_files": [
    ".powered-assert/**/*.js"
  ]
}
```

テスト用ビルドディレクトリもgitignore対象にする。

.gitignore
```
dist
build
.powered-assert/
-- 中略 --
```

testemの実行をコマンドとして追加しておく。

package.json
```json
-- 中略 --
  "scripts": {
    "gulp": "gulp",
    "gulp:mock": "MOCK=ON gulp",
    "build": "gulp build",
    "mocha": "mocha",
    "testem": "testem",
    "test": "mocha test/*-test.js"
  },
-- 中略 --
```

testemを起動する場合は次のようにして行う。起動したらブラウザでアクセスする。
```
$ npm run testem
```

一気に行う場合はciオプションで実行する。
```
$ npm run testem ci
```
