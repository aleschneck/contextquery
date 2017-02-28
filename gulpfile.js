var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var uglifyjs = require('uglify-js-harmony');
var minifier = require('gulp-uglify/minifier');
var rename = require("gulp-rename");
var pump = require('pump');
 
gulp.task('compress', function (cb) {
    var options = {
        preserveComments: 'license'
    };

  pump([
        gulp.src('templates/*.js'),
        minifier({}, uglifyjs),
        rename({ suffix: '.min' }),
        gulp.dest('dist')
    ],
    cb
  );
});


gulp.task('minify', function() {
  return gulp.src('templates/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(htmlmin({minifyJS: minifier({}, uglifyjs)}))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist'));
});