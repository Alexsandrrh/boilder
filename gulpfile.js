'use strict';

// Stack Plugins
const gulp = require('gulp');
const config = require('./config').gulp;
const del = require('del');
const If = require('gulp-if');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const argv = require('yargs').argv;

// Other Plugins
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');


// Set New Config
config.context = 'src';
config.output = 'dist';

// SASS
config.path.srcSass = `${config.context}/sass/main.scss`;
config.path.watchSass = `${config.context}/sass/**/**/*.{scss, sass}`;
config.path.destSass = `${config.output}/css`;

// Gulp Tasks

gulp.task('clean', () => {
   return del(config.output);
});

gulp.task('sass', () => {
    return gulp.src(config.path.srcSass)
        .pipe(plumber())
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers : ["last 15 version", "> 1%", "ie 8", "ie 7"],
            cascade : false
        }))
        .pipe(If(!argv.development, cssnano()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.path.destSass));
});

gulp.task('watch', () => {
   gulp.watch(config.path.watchSass, gulp.series('sass'));
});

gulp.task('build',  argv.development ? gulp.series('clean', 'sass', 'watch') : gulp.series('clean', 'sass'));
