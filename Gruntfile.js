module.exports = function (grunt) {

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-htmlmin");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    sass: {
      dist: {
        options: {
          style: "compressed",
          sourcemap: false,
          noCache: true
        },
        files: {
          "tmp/css/main.css" : "src/scss/main.scss"
        }
      }
    },
    cssmin: {
      target: {
        files: {
          "dest/css/main.min.css": "tmp/css/main.css"
        }
      }
    },
    concat: {
      build: {
        src: "src/js/*.js",
        dest: "tmp/js/main.js"
      }
    },
    uglify: {
      dist: {
        files: {
          "dest/js/main.min.js": "tmp/js/main.js"
        }
      }
    },
    htmlmin: {
      dist: {
        files: {
          "dest/index.html": "src/index.html"
        },
        options: {
          removeComments: true,
          collapseWhitespace: true
        }
      }
    },
    copy: {
      images: {
        files: [
          {
            expand: true,
            cwd: "src/images",
            src: "**",
            dest: "tmp/images"
          },  {
            expand: true,
            cwd: "src/images",
            src: "**",
            dest: "dest/images"
          }
        ]
      },
      jslib: {
        files: [
          {
            expand: true,
            cwd: "src/js/lib",
            src: "**",
            dest: "tmp/js/lib"
          },  {
            expand: true,
            cwd: "src/js/lib",
            src: "**",
            dest: "dest/js/lib"
          }
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      sass: {
        files: "src/scss/*.scss",
        tasks: [ "sass", "cssmin" ]
      },
      js: {
        files: "src/js/*.js",
        tasks: [ "concat", "uglify" ]
      },
      images: {
        files: "src/images/*",
        tasks: [ "copy" ]
      },
      jslib: {
        files: "src/js/lib/*.js",
        tasks: [ "copy" ]
      },
      html: {
        files: "src/*.html",
        tasks: [ "htmlmin" ]
      }
    }
  });
  grunt.registerTask("default", [ "concat", "uglify", "sass", "cssmin", "htmlmin", "copy" ]);
};
