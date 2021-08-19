/* 
Моя сборка Gulp. Последнее обновление: 4.08.2021, 2:36



*/



const {src, dest, watch, parallel, series} = require('gulp')
const scss = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create()
const uglify = require('gulp-uglify-es').default
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const del = require('del')
const webp = require('gulp-webp')
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')



function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'}) //нужен для того, чтобы при билде в dist передавались файлы вместе с папками
        .pipe(dest('dist'))
}


function cleanDist() { 
    return del('dist')
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir:'app/' // директория, в которой создается локальный сервер и из которой запускается index.html
        }
    })
    
}
function fonts() {
    src('app/fonts/**/*.ttf')
        .pipe(ttf2woff())
        .pipe(dest('app/fonts'))
    src('app/fonts/**/*.otf')
        .pipe()
    return src('app/fonts/**/*.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
}

function images() {
    return src('app/images/**/*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]
        ))
        .pipe(dest('dist/images'))
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest('dist/images'))
}

function scripts() { 
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/*.js',
        '!app/js/main.min.js' // "!" игнорирует файл main.min.js, чтобы он не конкатенировался сам в себя
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function styles(){
    return src(['app/scss/*.scss','app/scss/*.sass'])
        .pipe(scss({outputStyle: 'compressed'})) // сжимает файл
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function watching() {
    watch(['app/scss/**/*.sass','app/scss/**/*.scss'], styles)
    watch(['app/js/**/*.js','!app/js/main.min.js'], scripts)
    watch(['app/*.html']).on('change', browserSync.reload)
}



exports.styles = styles
exports.watching = watching
exports.browsersync = browsersync
exports.scripts = scripts
exports.images = images
exports.cleanDist = cleanDist
exports.fonts = fonts



exports.build = series(cleanDist, images, build) // процесс билда: сначала удаляем dist, затем загружаем изображения,
                                                 // потом билдим dist снова
exports.default = parallel(styles, scripts, browsersync, watching)