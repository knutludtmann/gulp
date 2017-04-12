var gulp = require('gulp'),
    path = require('path'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    argv = require('minimist')(process.argv.slice(2)),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    cachebust = require('gulp-cache-bust');



var config = require('./config.json');



// Sass
gulp.task('sass', function(done) {
    return gulp.src(paths().source.css)
        .pipe(sourcemaps.init())
        .pipe(sass.sync({ includePaths: ['node_modules/susy/sass'], noCache: true, outputStyle: 'compressed' }).on('error', sass.logError))

    .pipe(autoprefixer({
        browsers: ['last 20 versions', /*'ie 8', 'ie 9',*/ 'ie 10'],
        cascade: false
    }))

    .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(paths().public.css))
    done();
});



gulp.task('html', function() {
    return gulp.src(paths().source.html)
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest(paths().public.html))
});


function watch() {
    gulp.watch(path.resolve(paths().source.css)).on('change', gulp.series('sass', reloadCSS));
    gulp.watch(path.resolve(paths().source.html)).on('change', gulp.series('html', reload));
}



// Delete as clean task
gulp.task('clean', function() {
    return del([
        'public/'
    ]);
});

gulp.task('connect', gulp.series(function(done) {
    browserSync.init({
        server: {
            baseDir: resolvePath(paths().public.root)
        }
    }, function() {
        console.log('WATCHING FOR CHANGES');
        done();
    });
}));

function reload() {
    browserSync.reload({ stream: true });
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


gulp.task('default', gulp.series('clean', 'sass', 'html'));
gulp.task('watch', gulp.series('clean', 'default', 'connect', watch));