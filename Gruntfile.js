module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
                    'build/start.js',
                    'src/Base.js',
                    'src/Math.js',
                    'src/Arrows.js',
                    'src/Events.js',
                    'src/SelectionBox.js',
                    'src/Diagram.js',
                    'src/GridLayout.js',
                    'src/Layout.js',
                    'src/Figure.js',
                    'src/Connection.js',
                    'src/Anchor.js',
                    'src/ConnectionAnchor.js',
                    'src/Shape.js',
                    'src/Label.js',
                    'build/end.js'
                ],
                dest: 'dist/diagrams.js'
            }
        },

        lint: {
            all: ['grunt.js', 'dist/diagrams.js', 'test/*.js']
        },

        jshint: {
            options: {
                browser: true
            }
        },

        mocha: {
            all: [ 'test/test.html' ]
        },

        jsdoc: {
            dist: {
                src: ['src/**/*.js'],
                dest: 'doc/api'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: true,
                compress: true,
                report: 'gzip'
            },
            build: {
                src: 'dist/diagrams.js',
                dest: 'dist/diagrams.min.js'
            }
        },

        watch: {
            scripts: {
                files: ['src/*.js'],
                tasks: ['build'],
                options: {
                    nospawn: true
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-jsdoc-plugin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('test', ['concat', 'mocha']);
    grunt.registerTask('build', ['uglify']);
    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('doc', ['jsdoc']);
};

