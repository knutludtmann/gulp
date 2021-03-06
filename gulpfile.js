var gulp = require('gulp'),
    path = require('path'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    argv = require('minimist')(process.argv.slice(2)),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    cachebust = require('gulp-cache-bust'),
    gulpkss = require('gulp-kss'),
    concat = require('gulp-concat'),
    config = require('./config.json'),
    imagemin = require('gulp-imagemin'),
    mustache = require("gulp-mustache"),
    handlebars = require('gulp-compile-handlebars');


// Mustache
gulp.task('mustache', () => {
        return gulp.src(paths().source.mustache + '*.mustache')
            .pipe(mustache(paths().source.data, {extension: '.html'}))
            .pipe(gulp.dest('./public'))
    }
);


// Sass
gulp.task('sass', (done) =>
        gulp.src(paths().source.css)
            .pipe(sourcemaps.init())
            .pipe(sass.sync(
                {
                    includePaths: ['node_modules/susy/sass'],
                    noCache: true,
                    outputStyle: 'compressed'
                })
                .on('error', sass.logError))

            .pipe(autoprefixer({
                browsers: ['last 20 versions', /*'ie 8', 'ie 9',*/ 'ie 10'],
                cascade: false
            }))

            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(paths().public.css))

    //done();
);

// Image Minifying
gulp.task('image', () =>
    gulp.src(paths().source.images)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(paths().public.images))
);


gulp.task('html', () =>
    gulp.src(paths().source.html)
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest(paths().public.html))
);


function watch() {
    gulp.watch(path.resolve(paths().source.css)).on('change', gulp.series('sass', reloadCSS));
    gulp.watch(path.resolve(paths().source.html)).on('change', gulp.series('html', reloadHTML));
    gulp.watch(path.resolve(paths().source.mustache + '**/*.mustache')).on('change', gulp.series('mustache', reloadHTML));
    gulp.watch(path.resolve(paths().source.data)).on('change', gulp.series('mustache', reloadHTML));
}


// Delete as clean task
gulp.task('clean', () =>
    del([
        'public/'
    ])
);

gulp.task('connect', gulp.series(function (done) {
    browserSync.init({
        server: {
            baseDir: resolvePath(paths().public.root)
        }
    }, function () {
        console.log('WATCHING FOR CHANGES');
        done();
    });
}));

function reload() {
    browserSync.reload({stream: true});
}

function reloadCSS() {
    browserSync.reload('*.css');
}


function reloadHTML() {
    console.log('jetzt');
    browserSync.reload('*.html');
}


function resolvePath(pathInput) {
    return path.resolve(pathInput).replace(/\\/g, "/");
}

function paths() {
    return config.paths;
}


gulp.task('default', gulp.series('clean', 'sass', 'mustache'));
gulp.task('watch', gulp.series('clean', 'default', 'connect', watch));