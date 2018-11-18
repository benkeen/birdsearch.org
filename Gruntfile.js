const pkg = require('./package.json');

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	const version = pkg.version;
	const config = {
		watch: {
			sass: {
				files: ['**/*.scss'],
				tasks: ['sass', 'copy', 'cssmin']
			}
		},

		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: {
					'dist/css/styles.css': 'src/sass/styles.scss'
				}
			}
		},

		uglify: {
			libs: {
				files: {}
			}
		},

		copy: {
			fonts: {
				src: './src/css/fonts/*', dest: 'dist/fonts/', flatten: true, expand: true, filter: 'isFile'
			},
			libs: {
				src: './src/libs/*', dest: 'dist/libs/', flatten: true, expand: true, filter: 'isFile'
			},
			images: {
				src: '**/*',
				dest: 'dist/images/',
				cwd: 'src/images/',
				flatten: false,
				expand: true,
				filter: 'isFile'
			}
		},

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'dist/css/bootstrap.min.css': ['src/css/bootstrap-3.3.7.css'],
					[`dist/css/styles-${version}.css`]: ['dist/css/styles.css']
				}
			}
		},

		run: {
			webpack_dev: {
				cmd: 'npm',
				args: [
					'run',
					'webpack-dev'
				]
			},
			webpack_prod: {
				cmd: 'npm',
				args: [
					'run',
					'build'
				]
			}
		},

		concurrent: {
			watchers: {
				options: {
					logConcurrentOutput: true
				},
				tasks: ['watch', 'run:webpack_dev']
			}
		}
	};

	config.uglify.libs.files[`dist/libs-${version}.min.js`] = [
		'src/libs/bootstrap.js',
		'src/libs/gmaps.inverted.circle.js'
	];

	grunt.initConfig(config);

	grunt.registerTask('prod', ['sass', 'copy', 'cssmin', 'uglify', 'run:webpack_prod']);
	grunt.registerTask('dev', ['sass', 'copy', 'cssmin', 'uglify']);
	grunt.registerTask('start', ['dev', 'concurrent:watchers']);
};
