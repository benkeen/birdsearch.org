module.exports = function(grunt) {

	var config = {
		pkg: grunt.file.readJSON('package.json'),
		template: {
			dev: {
				options: {
					data: {
						ENV: "DEV"
					}
				},
				files: {
					'index.php': ['grunt_templates/index.template.tpl']
				}
			},
			prod: {
				options: {
					data: {
						ENV: "PROD",
						APP_START_PATH: ""
					}
				},
				files: {
					'index.php': ['grunt_templates/index.template.tpl']
				}
			}
		},
		uglify: {
			my_target: {
				files: {
					'build/core-js.min.js': [
						'libs/html5shiv.js',
						'libs/modernizr-2.0.6.min.js',
						'libs/jquery-ui-1.10.3.custom.min.js',
						'libs/jquery.tablesorter.min.js',
						'libs/jquery.tablesorter.widgets.js',
						'libs/jquery.metadata.js',
						'libs/spinners.min.js',
						'libs/gmaps.inverted.circle.min.js',
						'libs/bootstrap-modal.js',
						'libs/bootstrap-transition.js',
						'libs/require.min.js',
						'core/requireConfig.js'
					]
				}
			},
			options: {
				report: "min",
					compress: false
			}
		},
		md5: {
			prod: {
				files: {
					'build/appStart.min.js': 'build/appStart.min.js'
				},
				options: {
					after: function(fileChanges) {
						config.template.prod.options.data.APP_START_PATH = fileChanges[0].newPath;
					}
				}
			}
		},
		requirejs: {
			compile: {
				options: {
					name: "core/appStart",
					baseUrl: "./",
					mainConfigFile: "core/requireConfig.js",
					out: "./build/appStart.min.js"
				}
			}
		}
	};

	grunt.initConfig(config);

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-md5');
	grunt.loadNpmTasks('grunt-template');
	grunt.registerTask('default', ['uglify', 'requirejs', 'template']);
	grunt.registerTask('dev', ['uglify', 'requirejs', 'template:dev']);
	grunt.registerTask('prod', ['uglify', 'requirejs', 'md5', 'template:prod']);
};