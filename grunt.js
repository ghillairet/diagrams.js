module.exports = function(grunt) {

    grunt.initConfig({

        concat: {
            dist: {
                src: [
                    'build/start.js',
                    'src/util/point.js',
                    'src/util/line.js',
                    'src/extensions.js',
                    'src/events.js',
                    'src/arrows.js',
                    'src/element.js',
                    'src/svgelement.js',
                    'src/diagram.js',
                    'src/toolbox.js',
                    'src/shape/dragger.js',
                    'src/shape/selector.js',
                    'src/shape/anchor.js',
                    'src/shape/image.js',
                    'src/shape/label.js',
                    'src/shape/shape.js',
                    'src/shape/compartment.js',
                    'src/connection/anchor.js',
                    'src/connection/end.js',
                    'src/connection/label.js',
                    'src/connection/connection.js',
                    'src/palette/palette.js',
                    'src/properties/propertybox.js',
                    'build/end.js'
                ],
                dest: 'dist/diagram.js'
            }
        },

        lint: {
            all: ['grunt.js', 'dist/diagram.js', 'test/*.js']
        },

        jshint: {
            options: {
                browser: true
            }
        },

        mocha: {

            all: [ 'test/test.html' ]

        },

        min: {
            dist: {
                src: ['dist/diagram.js'],
                dest: 'dist/diagram.min.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-mocha');

    grunt.registerTask('test', 'concat mocha');
    grunt.registerTask('build', 'concat mocha min');

};