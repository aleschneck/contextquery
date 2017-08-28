var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var uglifyjs = require('uglify-es');
var composer = require('gulp-uglify/composer');
var minifier = composer(uglifyjs, console); //require('gulp-uglify/minifier');
var rename = require("gulp-rename");
var pump = require('pump');
 
gulp.task('compress', function (cb) {
    var options = {
        preserveComments: 'license'
    };

  pump([
        gulp.src('src/*.js'),
        minifier({}),
        rename({ suffix: '.min' }),
        gulp.dest('dist'),
        gulp.dest('example/html')
    ],
    cb
  );
});


gulp.task('minify', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true, minifyJS: minifier({}, uglifyjs)}))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('example/html'));
});