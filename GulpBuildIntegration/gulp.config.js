module.exports = function() {
    var config = {
       
        pluginPatterns: [
            'gulp-*',
            'gulp.*',
            'main-bower-files',
            'jshint-stylish',
            'jscs-stylish'
        ],

        fontFilePatterns: [
            '*.eot',
            '*.svg',
            '*.ttf',
            '*.woff',
            '*.woff2'
        ],

        sourceDirectories: {
            lib: 'Scripts/lib/',
            app: {
                scripts: 'Scripts/app/',
                styles: 'Content/styles/'
            }
        },

        buildDirectories: {
            js: 'Client/js/',
            css: 'Client/css/',
            fonts: 'Client/fonts/'
        },

        buildFiles: {
            lib: {
                css: 'lib.css',
                js: 'lib.js'
            },
            app: {
                css: 'app.css',
                js: 'app.js'
            },
            head: {
                js: 'head.js'
            }
        }

    };

    return config;
};