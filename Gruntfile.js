/*global module:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      src: ['Gruntfile.js', 'config.js', 'app.js', 'routes/*.js', 'tests/*.js', 'models/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: false,
        globals: {
          module: true,
          exports: true,
          require: true,
          process: true,
          describe: true,
          expect: true,
          it: true,
          __dirname: true,
          console: true
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', ['mochaTest']);

  // Default task.
  grunt.registerTask('default', ['jshint', 'test']);
};