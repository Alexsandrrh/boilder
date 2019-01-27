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
const named = require('vinyl-named');
const webpack = require('webpack-stream');
const htmlReplace = require('gulp-html-replace');
const rename = require('gulp-rename');
const htmlMin = require('gulp-htmlmin');


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
// React
config.path.srcReact = `${config.context}/react/index.js`;
config.path.watchReact = `${config.context}/react/**/**/**/**/*.{js, jsx}`;
config.path.destReact = config.path.destJs;
// Html
config.path.srcHtml = `${config.context}/templates/*.{html, pug, ejs, jade}`;
config.path.watchHtml = `${config.context}/templates/**/**/*.{html, pug, ejs, jade}`;
config.path.destHtml = `${config.output}`;

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
        .pipe(If(!argv.development, rename({
            suffix : '.min'
        })))
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
       .pipe(If(!argv.development, rename({
           suffix : '.min'
       })))
       .pipe(sourcemaps.write('.'))
       .pipe(gulp.dest(config.path.destJs));
});

gulp.task('react', () => {
    return gulp.src(config.path.srcReact)
        .pipe(plumber())
        .pipe(named(function() {
            return 'bundle'
        }))
        .pipe(webpack({
            mode : argv.development ? 'development' : 'production',
            watch : false,
            module: {
                rules: [
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                "presets": ["@babel/preset-env", "@babel/preset-react"]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(If(!argv.development, uglify()))
        .pipe(If(!argv.development, rename({
            suffix : '.min'
        })))
        .pipe(gulp.dest(config.path.destReact));
});

gulp.task('templates', () => {
   return gulp.src('src/templates/index.html')
       .pipe(plumber())
       .pipe(htmlReplace({
           css : {
               src : argv.development ? 'css/main.css' : 'css/main.min.css',
               tpl : '<link rel="stylesheet" type="text/css" href="%s">'
           },
           js: {
               src: argv.development ? ["js/vendor.js", "js/bundle.js"] : ["js/vendor.min.js", "js/bundle.min.js"],
               tpl: '<script type="text/javascript" src="%s"></script>'
           },
           react : {
               src: null,
               tpl : '<div id="layout"></div>'
           }
       }))
       .pipe(If(!argv.development, htmlMin({ collapseWhitespace: true })))
       .pipe(gulp.dest(config.path.destHtml));
});

gulp.task('server', function () {
   return nodemon({
       script: require('./package').main
   });
});

gulp.task('watch', () => {
   gulp.watch(config.path.watchSass, gulp.series('sass'));
   gulp.watch(config.path.watchImages, gulp.series('images'));
   gulp.watch(config.path.watchJs, gulp.series('js'));
   gulp.watch(config.path.watchHtml, gulp.series('templates'));
   gulp.watch(config.path.watchReact, gulp.series('react'));
});

gulp.task('build', gulp.series('clean', 'sass', 'js', 'react', 'templates', 'images'));

gulp.task('default',  argv.development ? gulp.series('build', gulp.parallel('watch', 'server')) : gulp.series('build'));
