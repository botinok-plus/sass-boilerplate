import gulp from 'gulp';
//import changed from 'gulp-changed';
import watch from 'gulp-watch';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import pug from 'gulp-pug';
import sass from 'gulp-sass';
import uglify from 'gulp-uglify';
import autoprefixer from 'gulp-autoprefixer';
import groupMedia from 'gulp-group-css-media-queries';
import rename from 'gulp-rename';
import npmSass from 'npm-sass';
import bs from 'browser-sync';
import path from 'path';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';

// Browser-sync
const browserSync = bs.create();

gulp.task('browser-sync', ['pug-loader', 'styles-loader', 'js-loader'], () => {
	browserSync.init({
		server: {
			baseDir: path.join(__dirname, 'app'),
		},
		notify: false
	});
});

// dev-task
gulp.task('dev', ['browser-sync'], () => {
	watch(path.join(__dirname, 'src/markup/**/*.pug'), () => {
		gulp.start('pug-loader');
	});

	const stylesLoader = () => {
		gulp.start('styles-loader');
	}

	watch(path.join(__dirname, 'src/styles/**/*.sass'), stylesLoader);
	watch(path.join(__dirname, 'src/styles/**/*.scss'), stylesLoader);

	watch(path.join(__dirname, 'src/scripts/**/*.js'), () => {
		gulp.start('js-loader');
	});
});

// pug-loader
gulp.task('pug-loader', () => gulp.src([path.join(__dirname, 'src/markup/pages', '*.pug')])
	//.pipe(changed(path.join(__dirname, 'app'), { extension: '.html' }))
	.pipe(plumber())
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest(path.join(__dirname, 'app')))
	.pipe(browserSync.stream())
);

// style-loader
gulp.task('styles-loader', () => gulp.src([path.join(__dirname, 'src/styles/inc.sass')])
	.pipe(plumber())
	.pipe(sass({importer: npmSass.importer}))
	.pipe(rename({
		basename: 'styles',
	}))
	.pipe(autoprefixer({browsers: ['last 10 versions'], cascade: false}))
	.pipe(groupMedia())
	.pipe(gulp.dest(path.join(__dirname, 'app/assets/css')))
	.pipe(browserSync.stream())
);

// js-loader
gulp.task('js-loader', () => gulp.src([path.join(__dirname, 'src/scripts/**/*.js')])
	.pipe(plumber())
	.pipe(webpackStream({
		mode: 'development',
		output: {
			filename: 'bundle.js'
		},
		module: {
			rules: [
				{
					test: /\.(js)$/,
					exclude: /(node_modules)/,
					loader: 'babel-loader',
					query: {
						presets: ['env']
					}
				}
			]
		},
		plugins: [
			new webpack.ProvidePlugin({
				$: 'jquery',
				jQuery: 'jquery',
				'window.jQuery': 'jquery'
			})
		]
	}, webpack))
	//.pipe(uglify())
	.pipe(gulp.dest(path.join(__dirname, 'app/assets/js')))
	.pipe(browserSync.stream())
);