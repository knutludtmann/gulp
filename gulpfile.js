var gulp = require('gulp'),
    path = require('path'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    cachebust = require('gulp-cache-bust'),
    config = require('./config.json'),
    imagemin = require('gulp-imagemin'),
    nunjucksRender = require('gulp-nunjucks-render'),
    data = require('gulp-data'),
    tailwindcss = require('tailwindcss'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('gulp-autoprefixer'),
    purgecss = require('gulp-purgecss'),
    postcssimport = require('postcss-import'),
    cacheBuster = require('gulp-cache-bust');



gulp.task('nunjucks', function () {
    // Gets .html and .nunjucks files in pages
    return gulp.src('src/pages/**/*.+(html|njk)')
        .pipe(data(function () {
            return require('./src/data/data.json')
        }))
        .pipe(nunjucksRender({
            path: ['src/templates']
        }))
        // output files in app folder
        .pipe(gulp.dest('public'))
});

gulp.task('cacheBuster', function () {
    return gulp.src('./public/*.html')
        .pipe(cacheBuster())
        .pipe(gulp.dest('./public/'));
});


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

// CSS
gulp.task('css', () => {
    return gulp.src(paths().source.css)
        .pipe(postcss([
            postcssimport,
            tailwindcss('./tailwind.js'),
            autoprefixer

        ]))
        /*.pipe(
            purgecss({
                content: [paths().public.html + '*.html'],
                extractors: [
                    {
                        extractor: class TailwindExtractor {
                            static extract(content) {
                                return content.match(/[A-z0-9-:\/]+/g) || [];
                            }
                        },
                        extensions: ['css', 'html']
                    }
                ]
            })
        )*/
        .pipe(gulp.dest(paths().public.css))
});

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

// Copy Video
gulp.task('video', () =>
    gulp.src(paths().source.videos)
        .pipe(gulp.dest(paths().public.videos))
);

// Copy Fonts
gulp.task('fonts', () =>
    gulp.src(paths().source.fonts)
        .pipe(gulp.dest(paths().public.fonts))
);


gulp.task('html', () =>
    gulp.src(paths().source.html)
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest(paths().public.html))
);


function watch() {
    gulp.watch(path.resolve(paths().source.css)).on('change', gulp.series('css', reloadCSS));
    //gulp.watch(path.resolve(paths().source.html)).on('change', gulp.series('html', reloadHTML));
    gulp.watch(path.resolve(paths().source.templates)).on('change', gulp.series('nunjucks','cacheBuster', reloadHTML));
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
    browserSync.reload('*.html');
}


function resolvePath(pathInput) {
    return path.resolve(pathInput).replace(/\\/g, "/");
}

function paths() {
    return config.paths;
}


gulp.task('default', gulp.series('clean', 'nunjucks', 'css', 'video', 'image', 'fonts', 'cacheBuster'));
gulp.task('watch', gulp.series('clean', 'default', 'connect', watch));