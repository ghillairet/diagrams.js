module.exports = function(grunt) {

    grunt.initConfig({

        concat: {
            dist: {
                src: [
                    'build/start.js',
                    'src/extensions.js',
                    'src/styles/Styles.js',
                    'src/base/Point.js',
                    'src/base/Line.js',
                    'src/base/Events.js',
                    'src/base/Element.js',
                    'src/figures/Figure.js',
                    'src/figures/Rectangle.js',
                    'src/figures/Circle.js',
                    'src/figures/Ellipse.js',
                    'src/figures/Path.js',
                    'src/figures/Text.js',
                    'src/diagram/DiagramElement.js',
                    'src/layout/Layout.js',
                    'src/diagram/LayoutElement.js',
                    'src/diagram/Diagram.js',
                    'src/diagram/Toolbox.js',
                    'src/layout/GridLayout.js',
                    'src/layout/FlowLayout.js',
                    'src/layout/XYLayout.js',
                    'src/layout/BorderLayout.js',
                    'src/shape/BoundBox.js',
                    'src/shape/Selector.js',
                    'src/shape/Anchor.js',
                    'src/shape/Image.js',
                    'src/shape/Label.js',
                    'src/shape/Shape.js',
                    'src/connection/Arrows.js',
                    'src/connection/Anchor.js',
                    'src/connection/ConnectionEnd.js',
                    'src/connection/ConnectionLabel.js',
                    'src/connection/FlexPoint.js',
                    'src/connection/Connection.js',
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

        min: {
            dist: {
                src: ['dist/diagrams.js'],
                dest: 'dist/diagrams.min.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-jsdoc-plugin');

    grunt.registerTask('test', 'concat mocha');
    grunt.registerTask('build', 'concat min');
    grunt.registerTask('doc', 'jsdoc');

};
