const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },

        notify: false
    })
}

function styles() { // функція для стилів
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' })) //зжимає вміст файлу стайл.мін
        .pipe(concat('style.min.css')) //створює файл з конвертованими данними
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions '],
            grid: true
        })) // для включення підтримки CSS3-властивостей у браузерах
        .pipe(dest('app/css'))
        .pipe(browserSync.stream()) //stream додає стилі, а не оновлює сторінку
}

function scripts() { // функція для скриптів
    return src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/slick-carousel/slick/slick.js',
            'node_modules/mixitup/dist/mixitup.js',
            'app/js/main.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify()) //мінімізація js
        .pipe(dest('app/js')) //закидує файл в папку
        .pipe(browserSync.stream())

}

function images() {
    return src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function cleanDist() {
    return del('dist')
}

function build() {
    return src([
            'app/**/*.html',
            'app/css/style.min.css',
            'app/js/main.min.js',
        ], { base: 'app' })
        .pipe(dest('dist'))
}

function watching() {
    watch(['app/scss/**/*.scss'], styles); //функція автоматичного оновлення файлів
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); // !-крім цієї папки
    watch(['app/**/*.html']).on('change', browserSync.reload)
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.images = images;
exports.cleanDist = cleanDist;
exports.watching = watching;
exports.build = series(cleanDist, images, build); //чітка послідовність

exports.default = parallel(styles, scripts, browsersync, watching) // паралельно вмикаються