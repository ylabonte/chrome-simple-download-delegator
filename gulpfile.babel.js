const { dest, parallel, series, src, watch } = require('gulp');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const zip = require('gulp-zip');
const del = require('del');
const fs = require('fs');
const packageInfo = JSON.parse(fs.readFileSync('./package.json'));
let manifest = JSON.parse(fs.readFileSync('./src/manifest.json'));

function cleanBuild() {
  return del('build/');
}

function cleanDist() {
  return del('dist/');
}

function cleanBuildStyles() {
  return del('./build/styles/*');
}

function cleanBuildScripts() {
  return del('./build/scripts/*');
}

function jQueryInclude() {
  return src('./node_modules/jquery/dist/jquery.js')
  .pipe(dest('./build/scripts/'));
}

function materializeCssInclude() {
  return src('./node_modules/materialize-css/dist/css/materialize.css')
  .pipe(dest('./build/styles/'));
}

function materializeJsInclude() {
  return src('./node_modules/materialize-css/dist/js/materialize.js')
  .pipe(dest('./build/scripts/'));
}

function cssTranspile(cb) {
  return src('./src/styles/**/*.css')
    .pipe(dest('./build/styles/'));
}

function cssMinify() {
  return src('./build/styles/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./build/styles/'));
}

function jsTranspile() {
  return src('./src/scripts/**/*.js')
    .pipe(babel({presets: [[ "env", {"targets": {"chrome": "60"}} ]]}))
    .pipe(dest('./build/scripts/'));
}

function jsMinify() {
  return src('./build/scripts/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(terser({ mangle: false }))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./build/scripts/'));
}

function copyLanguageFiles() {
  return src('./src/_locales/**/*')
    .pipe(dest('./build/_locales/'));
}

function htmlCopy() {
  return src('./src/*.html')
    .pipe(dest('./build/'));
}

function imgCopy() {
  return src('./src/images/**/*')
    .pipe(dest('./build/images/'));
}

function zipPackage() {
  return src('./build/**/*')
    .pipe(zip(`${packageInfo.name}-v${packageInfo.version}.zip`))
    .pipe(dest('./dist/'));
}

function writeManifest(cb) {
  manifest.version = packageInfo.version;
  fs.writeFileSync('./build/manifest.json', JSON.stringify(manifest));
  cb();
}

function doWatch() {
  watch('src/manifest.json', writeManifest);
  watch('src/*.html', htmlCopy);
  watch('src/_locales/**/*.json', copyLanguageFiles);
  watch('src/images/**/*', imgCopy);
  watch('src/scripts/**/*.js', series(cleanBuildScripts, jQueryInclude, materializeJsInclude, jsTranspile, jsMinify));
  watch('src/styles/**/*.css', series(cleanBuildStyles, materializeCssInclude, cssTranspile, cssMinify));
}


// Public `clean` task.
exports.clean = series(
  cleanBuild,
  cleanDist
);

// Public `build` task.
exports.build = series(
  parallel(jQueryInclude, materializeCssInclude, materializeJsInclude),
  parallel(cssTranspile, jsTranspile, copyLanguageFiles),
  parallel(imgCopy, htmlCopy, cssMinify, jsMinify, writeManifest)
);

// Public `pack` task.
exports.pack = series(
  exports.build,
  zipPackage,
);

// Public `watch`task.
exports.watch = series(
  doWatch,
);

// Public default task (`pack`).
exports.default = series(
  exports.clean,
  exports.build,
  exports.watch
);
