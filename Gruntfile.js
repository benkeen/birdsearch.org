module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			}
//			build: {
//				src: 'src/<%= pkg.name %>.js',
//				dest: 'build/<%= pkg.name %>.min.js'
//			}
		},
		requirejs: {
			compile: {
				options: {
					baseUrl: "./",
					mainConfigFile: "core/app.build.js",
					out: "output/"
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['uglify']);
};