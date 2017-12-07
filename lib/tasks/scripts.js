module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

	return function(done) {
		if(!config.scripts) return done()
		var c = require('better-console')
		c.info('~ scripts')

		var _ = require('lodash')
		var cache = require('gulp-cached')
		var plumber = require('gulp-plumber')
		var replace = require('gulp-replace')
		var sourcemaps = require('gulp-sourcemaps')
		var uglify = require('gulp-uglify-es').default

		var rollup = require('gulp-better-rollup')
		var rollup_babel = require('rollup-plugin-babel')
		var rollup_commonjs = require('rollup-plugin-commonjs')
		var rollup_resolve = require('rollup-plugin-node-resolve')
		var rollup_json = require('rollup-plugin-json')
		var rollup_yaml = require('rollup-plugin-yaml')

		var babelPresets = [
			[ require.resolve('@babel/preset-env'), { modules: false } ],
			require.resolve('@babel/preset-react'),
			require.resolve('@babel/preset-typescript'),
		]

		var rollupOptions = {
			plugins: [
				rollup_commonjs({
					extensions: [ '.js', '.es6', ,'.es', '.jsx', '.ts' ]
				}),
				rollup_resolve({
					jsnext: true,
					browser: true,
				}),
				rollup_json(),
				rollup_yaml(),
				rollup_babel({
					exclude: 'node_modules/**',
					highlightCode: false,
					comments: false,
					compact: true,
					presets: babelPresets,
					plugins: [
							"@babel/plugin-syntax-decorators",
							"@babel/plugin-syntax-class-properties",
							"@babel/plugin-syntax-object-rest-spread",
						].map(require.resolve), // as Babel looks for a plugin
				}),
			]
		}

		var task = gulp.src(config.scripts, { base: config.src_folder, cwd: config.dir })

		// Init plumber in devmode
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		task = task
			.pipe(rollup(rollupOptions, 'iife'))
			.pipe(replace(/process\.env\.NODE_ENV/g, config.devmode ? "'development'" : "'production'")) // do simple envify
			.pipe(replace('DEBUG', config.devmode ? 'true' : 'false')) // inject DEBUG variable
			.pipe(cache('scripts', { optimizeMemory: true }))

		if(config.devmode) {
			task = task.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(sourcemaps.write('.'))
		} else {
			if(config.uglify !== false){
				var uglifyOptions = (typeof config.uglify == 'object') ? config.uglify : {}
				task = task.pipe(uglify(uglifyOptions))
			}
		}

		if(config.devmode){
			task.on('end', function() {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_persistent_folder))
	}
}
