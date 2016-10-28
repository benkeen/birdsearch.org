module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var appFiles = [
    './core/*.js',
    './core/*.jsx',
		'./i18n/*.jsx',
    './components/**/*.js',
    './components/**/*.jsx'
  ];

  const package = grunt.file.readJSON('package.json');
  const version = package.version;
  var config = {
		pkg: package,

    // this task converts javascript/JSX files and stashes an es5-friendly version of them in /dist
		babel: {
			options: {
        plugins: ['transform-react-jsx', 'transform-object-assign'],
				sourceMap: true,
				presets: ['es2015', 'react']
			},
			jsx: {
				files: [{
					expand: true,
					cwd: './src',
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
          [`dist/bundle-${version}.js`]: 'dist/core/init.js'
        }
      }
    },

    watch: {
      scripts: {
        cwd: './src',
        files: ['**/*.jsx'],
        tasks: ['babel:jsx', 'browserify']
      },
      sass: {
        files: ['**/*.scss'],
        tasks: ['sass']
      }
    },

    template: {
      indexFile: {
        options: {
          data: { version: package.version }
        },
        files: {
          'dist/index.html': ['template-index.html']
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          [`dist/css/styles-${version}.css`]: 'src/css/sass/styles.scss'
        }
      }
    },

		copy: {
      fonts: { src: './src/css/fonts/*', dest: 'dist/fonts/', flatten: true, expand: true, filter: 'isFile' },
      libs: { src: './src/libs/*', dest: 'dist/libs/', flatten: true, expand: true, filter: 'isFile' },
      css: { src: './src/css/bootstrap.min.css', dest: 'dist/css/', flatten: true, expand: true, filter: 'isFile' },
      images: { src: '**/*', dest: 'dist/images/', cwd: 'src/images/', flatten: false, expand: true, filter: 'isFile' }
		}
	};

	grunt.initConfig(config);
  grunt.registerTask('local', ['babel:jsx', 'browserify', 'sass', 'copy']);
  grunt.registerTask('start', ['local', 'watch']);

  // whenever the version changes, run this to regenerate the index.html file with cache-busted JS and CSS files
  grunt.registerTask('versionUpdate', ['template', 'local']);
};
