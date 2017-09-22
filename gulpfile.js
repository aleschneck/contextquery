const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const uglifyjs = require('uglify-es');
const composer = require('gulp-uglify/composer');
const minifier = composer(uglifyjs, console); //require('gulp-uglify/minifier');
const rename = require("gulp-rename");
const pump = require('pump');
const jsBuilder = require('gulp-systemjs-builder');
 
gulp.task('compress', function (cb) {
    let options = {
        preserveComments: 'license'
    };

  pump([
        gulp.src('dist/*.js'),
        minifier({
          mangle: false
        }),
        rename({ suffix: '.min' }),
        gulp.dest('dist/min'),
        gulp.dest('example/js')
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

gulp.task('build', () => {
	let builder = jsBuilder('./src');
	builder.config({
		transpiler: 'plugin-babel',
		paths: {
			"node:*": "./node_modules/*"
		},
		map: {
 			'plugin-babel': 'node:systemjs-plugin-babel/plugin-babel.js',
			'systemjs-babel-build': 'node:systemjs-plugin-babel/systemjs-babel-browser.js'
		},
		meta: {
			'*.js': {
				babelOptions: {es2015: false}
			}
		}
	});
  return builder.buildStatic('./src/context.js', 'context.js', {globalName: 'cq'})
    .pipe(gulp.dest('./example/js'))
    .pipe(gulp.dest('./dist'));
});