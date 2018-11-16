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

		template: {
			dev: {
				options: {
					data: {version: pkg.version}
				},
				files: {
					'dist/index.html': ['src/template-dev.html']
				}
			},
			prod: {
				options: {
					data: {version: pkg.version}
				},
				files: {
					'dist/index.html': ['src/template-prod.html']
				}
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

	grunt.initConfig(config);

	grunt.registerTask('prod', ['sass', 'copy', 'cssmin']); // 'template:prod'
	grunt.registerTask('dev', ['sass', 'copy', 'cssmin']); // 'template:dev',
	grunt.registerTask('start', ['dev', 'concurrent:watchers']);
};
