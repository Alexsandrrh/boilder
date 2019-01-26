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
const imagemin = require('gulp-imagemin');
const nodemon = require('gulp-nodemon');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');


// Set New Config
config.context = 'src';
config.output = 'dist';

// Sass
config.path.srcSass = `${config.context}/sass/main.scss`;
config.path.watchSass = `${config.context}/sass/**/**/*.{scss, sass}`;
config.path.destSass = `${config.output}/css`;
// Images
config.path.srcImages = `${config.output}/images/**/**/*.{png, jpeg, gif, jpg}`;
config.path.watchImages = config.path.srcImages;
config.path.destImages = `${config.output}/img`;
// Js
config.path.srcJs = `${config.context}/js/**/**/*.js`;
config.path.watchJs = config.path.srcJs;
config.path.destJs = `${config.output}/js`;


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

gulp.task('images', () => {
    return gulp.src(config.path.srcImages)
        .pipe(plumber())
        .pipe(If(!argv.development, imagemin()))
        .pipe(gulp.dest(config.path.destImages));
});

gulp.task('js', () => {
   return gulp.src(config.path.srcJs)
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(babel({
           presets: ['@babel/env']
       }))
       .pipe(concat('vendor.js'))
       .pipe(If(!argv.development, uglify()))
       .pipe(sourcemaps.write('.'))
       .pipe(gulp.dest(config.path.destJs));
});

gulp.task('server', function () {
   return nodemon({
       script: require('./package').main
   });
});

gulp.task('watch', () => {
   gulp.watch(config.path.watchSass, gulp.series('sass'));
});

gulp.task('build', gulp.series('clean', 'sass', 'js', 'images'));

gulp.task('default',  argv.development ? gulp.series('build', gulp.parallel('watch', 'server')) : gulp.series('build'));
