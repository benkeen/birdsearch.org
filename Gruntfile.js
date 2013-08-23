module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		template: {
			'process-html-template': {
				options: {
					data: {
						ENV: "PROD", // PROD / DEV
						NOW: Math.round(new Date().getTime() / 1000)
					}
				},
				files: {
					'index.html': ['index.template.tpl']
				}
			}
		},
		uglify: {
			my_target: {
				files: {
					'libs/core-libs.min.js': [
						'libs/html5shiv.js',
						'libs/modernizr-2.0.6.min.js',
						'libs/jquery-ui-1.10.3.custom.min.js',
						'libs/spinners.min.js',
						'libs/gmaps.inverted.circle.min.js',
						'libs/bootstrap-modal.js',
						'libs/bootstrap-transition.js'
					]
				}
			},
			options: {
				report: "min",
				compress: false
			}
		},
		requirejs: {
			compile: {
				options: {
					name: "core/appStart",
					baseUrl: "./",
					mainConfigFile: "core/requireConfig.js",
					out: "./core/appStart.min.js"
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-template');
	grunt.registerTask('default', ['uglify', 'requirejs', 'template']);
};