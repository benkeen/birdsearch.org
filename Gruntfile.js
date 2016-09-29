module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var appFiles = [
    './src/core/*.js',
    './src/core/*.jsx',
		'./src/i18n/*.jsx',
    './src/components/**/*.js',
    './src/components/**/*.jsx'
  ];

  var config = {
		pkg: grunt.file.readJSON('package.json'),

    // this task just converts ALL javascript/JSX files and stashes an es5-friendly version of them in /dist
		babel: {
			options: {
        plugins: ['transform-react-jsx'],
				sourceMap: true,
				presets: ['es2015', 'react']
			},
			jsx: {
				files: [{
					expand: true,
					cwd: './',
					src: appFiles,
					dest: 'dist',
					ext: '.js'
				}]
			}
		},

    // bundles up the whole shebang
    browserify: {
      dist: {
        cwd: './',
        files: {
          "dist/bundle.js": "dist/core/init.js"
        }
      }
    },

    watch: {
      scripts: {
        files: appFiles,
        tasks: ['babel:jsx', 'browserify']
      },
      sass: {
        files: ['**/*.scss'],
        tasks: ['sass']
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'dist/css/styles.css': 'src/css/sass/styles.scss'
        }
      }
    },

		copy: {
      fonts: { src: './src/css/fonts/*', dest: 'dist/fonts/', flatten: true, expand: true, filter: 'isFile' },
      libs: { src: './src/libs/*', dest: 'dist/libs/', flatten: true, expand: true, filter: 'isFile' },
      css: { src: './src/css/bootstrap.min.css', dest: 'dist/css/', flatten: true, expand: true, filter: 'isFile' },
      images: { src: './src/images/**/*', dest: 'dist/', flatten: false, expand: true, filter: 'isFile' }
		}
	};

	grunt.initConfig(config);
  grunt.registerTask('local', ['babel:jsx', 'browserify', 'sass', 'copy']);
  grunt.registerTask('start', ['local', 'watch']);
};
