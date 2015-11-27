module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true,
        singleRun: false
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        // Order is important! gameLogic.js must be first because it defines myApp angular module.
        src: [
        'ts_output_readonly_do_NOT_change_manually/src/gameLogic.js',
        'ts_output_readonly_do_NOT_change_manually/src/game.js',
        'ts_output_readonly_do_NOT_change_manually/src/aiService.js'
      ],
        dest: 'dist/everything.js',
      },
    },
    uglify: {
      options: {
        sourceMap: true,
      },
      my_target: {
        files: {
          'dist/everything.min.js': ['dist/everything.js']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'game.min.html': ['game.html']
        }
      }
    },
    manifest: {
      generate: {
        options: {
          basePath: '.',
          cache: [
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js',
            'http://yoav-zibin.github.io/emulator/dist/turnBasedServices.3.min.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-touch.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.1/ui-bootstrap-tpls.min.js',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/fonts/glyphicons-halflings-regular.woff',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/fonts/glyphicons-halflings-regular.ttf',
            'http://yoav-zibin.github.io/emulator/main.css',
            'dist/everything.min.js',
            'game.css',
            'languages/en.js',
            'imgs/HelpSlide1.png',
            'imgs/HelpSlide2.png',
            'imgs/HelpSlide3.png',
            'imgs/HelpSlide4.png',
            'imgs/HelpSlide5.png',
            'imgs/HelpSlide6.png',
            'imgs/HelpSlide7.png',
            'imgs/HelpSlide8-1.png',
            'imgs/HelpSlide8-2.png',
            'imgs/HelpSlide9.png',
            'imgs/HelpSlide10.png',
            'imgs/HelpSlide11.png',
            'imgs/HelpSlide12.png',
            'imgs/Chess-BBishop.png',
            'imgs/Chess-BKing.png',
            'imgs/Chess-BKnight.png',
            'imgs/Chess-BPawn.png',
            'imgs/Chess-BQueen.png',
            'imgs/Chess-BRook.png',
            'imgs/Chess-WBishop.png',
            'imgs/Chess-WKing.png',
            'imgs/Chess-WKnight.png',
            'imgs/Chess-WPawn.png',
            'imgs/Chess-WQueen.png',
            'imgs/Chess-WRook.png',
          ],
          network: [
          'dist/everything.min.js.map',
          'dist/everything.js',
          'languages/zh.js',
          ],
          timestamp: true
        },
        dest: 'game.appcache',
        src: []
      }
    },
    'http-server': {
        'dev': {
            // the server root directory
            root: '.',
            port: 9000,
            host: "0.0.0.0",
            cache: 1,
            showDir : true,
            autoIndex: true,
            // server default file extension
            ext: "html",
            // run in parallel with other tasks
            runInBackground: true
        }
    },
    protractor: {
      options: {
        configFile: "protractor.conf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      all: {}
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-manifest');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-protractor-coverage');

  // // Default task(s).
  // grunt.registerTask('default', ['jshint', 'karma',
  //     'concat', 'uglify',
  //     'processhtml', 'manifest',
  //     'http-server', 'protractor']);
  // Default task(s).
  grunt.registerTask('default', [
      'concat', 'uglify',
      'processhtml', 'manifest']);
};
