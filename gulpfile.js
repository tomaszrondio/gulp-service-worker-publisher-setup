const { watch, src, dest, series, parallel } = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const del = require('del');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const replace = require('gulp-replace')

const config = {
  app: {
    js: [
      './public/js/vendor/*js',
      './public/js/scripts/*.js'
    ],
    sass: './public/css/**/*.sass',
    htmlFile: './views/base.html.twig'
  },
  dist: {
    base: './public/dist/',
    html: './views/'
  }
}

let hashCode = new Date().getTime();

function jsDev(done) {
  src(config.app.js, { sourcemaps: true })
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(concat('bundle.dev.js'))
    .pipe(dest(config.dist.base, { sourcemaps: true }))
  done();
}

function jsBuild(done) {
  src(config.app.js)
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.' + hashCode }))
    .pipe(dest(config.dist.base))
  done();
}

function cssBuild(done) {
  src(config.app.sass)
    .pipe(concat('bundle.sass'))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ suffix: '.' + hashCode }))
    .pipe(dest(config.dist.base))
  done();
}

function cssDev(done) {
  src(config.app.sass, { sourcemaps: true })
    .pipe(concat('bundle.dev.sass'))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(dest(config.dist.base, { sourcemaps: true }))
  done();
}

function setHash(done) {
  src(config.app.htmlFile)
    .pipe(replace(/assetsHash\s=\s\'.*\'/g, 'assetsHash = \'' + hashCode + '\''))
    .pipe(dest(config.dist.html));
  done();
};

function setDevHash(done) {
  src(config.app.htmlFile)
    .pipe(replace(/assetsHash\s=\s\'.*\'/g, 'assetsHash = \'dev\''))
    .pipe(dest(config.dist.html));
  done();
};

function watchFiles() {
  watch(config.app.js, jsDev);
  watch(config.app.sass, cssDev);
}

function cleanUp() {
  return del([config.dist.base]);
}

exports.watch = series(cleanUp, setDevHash, parallel(jsDev, cssDev, watchFiles));
exports.build = series(cleanUp, parallel(jsBuild, cssBuild, setHash));
