var gulp = require('gulp');
var config = require('./gulp.config')();

var plugins = require('gulp-load-plugins')({
    pattern: config.pluginPatterns,
    replaceString: /\bgulp[\-.]/
});

function errorHandler(error) {
    'use strict';
    console.log(error);
    this.emit('end');
}

// Download Bower components
gulp.task('bower', function () {
    'use strict';
    return plugins.bower({ layout: 'byComponent' });
});

/* -----------------------------------------------------------------------------------------------
 * FONTS
 */

// Remove font files generated from previous build
gulp.task('clean-fonts', function () {
    'use strict';
    var fontFilePaths = config.fontFilePatterns.map(function () {
        return config.buildDirectories.fonts + 'pattern';
    });

    return gulp.src(fontFilePaths, { read: false })
        .pipe(plugins.clean());
});

// Move font files to build directory
gulp.task('build-fonts', ['clean-fonts'], function () {
    'use strict';
    return gulp.src(config.sourceDirectories.lib + 'fontawesome/fonts/fontawesome-webfont.*')
        .pipe(gulp.dest(config.buildDirectories.fonts));
});

/* -----------------------------------------------------------------------------------------------
 * STYLES
 */

// Remove lib.css files generated from previous build
gulp.task('lib-styles-clean', function () {
    'use strict';
    return gulp.src(config.buildDirectories.css + 'lib*.css*', { read: false })
        .pipe(plugins.clean());
});

// Build lib.css file (concatenate into a single file)
gulp.task('lib-styles-build', ['lib-styles-clean'], function () {
    'use strict';
    return gulp.src(plugins.mainBowerFiles(), {
            paths: {
                bowerDirectory: config.sourceDirectories.lib,
                bowerrc: '.bowerrc',
                bowerJson: 'bower.json'
            }
        })
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.filter(function(file) {
            return /\.css$/.test(file.path) &&
                !/\.min\.css$/.test(file.path);
        }))
        .pipe(plugins.concat(config.buildFiles.lib.css))
        .pipe(gulp.dest(config.buildDirectories.css));
});

// Optimize lib.css file (add hash to filename, minify, apply vendor prefixes, and generate sourcemap)
gulp.task('lib-styles-build-optimize', ['lib-styles-build'], function () {
    'use strict';
    return gulp.src(config.buildDirectories.css + config.buildFiles.lib.css)
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean())
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.init())  // Performance issues on CI server
        .pipe(plugins.csso())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.buildDirectories.css));
});

// Remove app.css files generated from previous build
gulp.task('app-styles-clean', function () {
    'use strict';
    return gulp.src(config.buildDirectories.css + 'app*.css*', { read: false })
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean());
});

// Build app.css file (compile less files and concatenate into a single file)
gulp.task('app-styles-build', ['app-styles-clean'], function() {
    'use strict';
    return gulp.src([
            config.sourceDirectories.app.styles + '**/*.less',
            config.sourceDirectories.app.styles + '**/*.css'
        ])
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.less())
        .pipe(plugins.concat(config.buildFiles.app.css))
        .pipe(gulp.dest(config.buildDirectories.css));
});

// Optimize app.css file (add hash to filename, minify, apply vendor prefixes, and generate sourcemap)
gulp.task('app-styles-build-optimize', ['app-styles-build'], function () {
    'use strict';
    return gulp.src(config.buildDirectories.css + config.buildFiles.app.css)
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean())
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.init())  // Performance issues on CI server
        .pipe(plugins.csso())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.buildDirectories.css));
});

// Build all CSS files for local development environment
gulp.task('build-styles', ['lib-styles-build', 'app-styles-build']);

// Add watch for local development environment
gulp.task('watch-styles', function () {
    'use strict';
    gulp.watch(config.sourceDirectories.app.styles + '**/*.less', ['build-styles']);
});

// Build optimized CSS files for deployment to non-local environment (qa, staging, production)
gulp.task('build-styles-optimize', ['lib-styles-build-optimize', 'app-styles-build-optimize']);

/* -----------------------------------------------------------------------------------------------
 * SCRIPTS
 */

// Lint non-lib JavaScript files
gulp.task('lint-js', function () {
    'use strict';
    return gulp.src(config.sourceDirectories.app.scripts + '**/*.js')
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.filter(function (file) {
            return /\.js$/.test(file.path) &&
                !/\.spec\.js/.test(file.path);
        }))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter(plugins.jshintStylish));
});

// Test non-lib JavaScript files
gulp.task('test-js', function () {
    'use strict';
    return gulp.src(plugins.mainBowerFiles(), {
            paths: {
                bowerDirectory: config.sourceDirectories.lib,
                bowerrc: '.bowerrc',
                bowerJson: 'bower.json'
            }
        })
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.filter(function(file) {
            return /\.js$/.test(file.path) &&
                !/\.min\.js$/.test(file.path) &&
                !/modernizr\.js/.test(file.path);
        }))
        .pipe(plugins.addSrc(config.sourceDirectories.app.scripts + 'global.js'))
        .pipe(plugins.addSrc(config.sourceDirectories.app.scripts + '**/*.js'))
        .pipe(plugins.karma({
            configFile: 'karma.config.js'
        }));
});

// Add test-specific watch for local development environment
gulp.task('watch-tests', function () {
    'use strict';
    gulp.watch(config.sourceDirectories.app.scripts + '**/*.js', ['test-js']);
});

// Remove head.js files generated from previous build
gulp.task('head-js-clean', function () {
    'use strict';
    return gulp.src(config.buildDirectories.js + 'head*.js*', { read: false })
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean());
});

// Build head.js and add to build directory
gulp.task('head-js-build', ['head-js-clean'], function () {
    'use strict';
    return gulp.src(config.sourceDirectories.lib + '**/modernizr.js')
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.concat(config.buildFiles.head.js))
        .pipe(gulp.dest(config.buildDirectories.js));
});

// Optimize head.js and add to build directory
gulp.task('head-js-build-optimize', ['head-js-build'], function () {
    'use strict';
    return gulp.src(config.buildDirectories.js + config.buildFiles.head.js)
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean())
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.buildDirectories.js));
});

// Remove lib.js files generated from previous build
gulp.task('lib-js-clean', function () {
    'use strict';
    return gulp.src(config.buildDirectories.js + 'lib*.js*', { read: false })
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean());
});

// Build lib.js and add to build directory
gulp.task('lib-js-build', ['lib-js-clean'], function () {
    'use strict';
    return gulp.src(plugins.mainBowerFiles(), {
            paths: {
                bowerDirectory: config.sourceDirectories.lib,
                bowerrc: '.bowerrc',
                bowerJson: 'bower.json'
            }
        })
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.filter(function(file) {
            return /\.js$/.test(file.path) &&
                !/\.min\.js$/.test(file.path) &&
                !/modernizr\.js/.test(file.path);
        }))
        .pipe(plugins.concat(config.buildFiles.lib.js))
        .pipe(gulp.dest(config.buildDirectories.js));
});

// Optimize lib.js and add to build directory
gulp.task('lib-js-build-optimize', ['lib-js-build'], function () {
    'use strict';
    return gulp.src(config.buildDirectories.js + config.buildFiles.lib.js)
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean())
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.buildDirectories.js));
});

// Remove app.js files generated from previous build
gulp.task('app-js-clean', function () {
    'use strict';
    return gulp.src(config.buildDirectories.js + 'app*.js*', { read: false })
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean());
});

// Build app.js and add to build directory
gulp.task('app-js-build', ['lint-js', 'test-js', 'app-js-clean'], function () {
    'use strict';
    return gulp.src(config.sourceDirectories.app.scripts + '**/*.js')
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.filter(function (file) {
            return /\.js$/.test(file.path) &&
                !/\.spec\.js/.test(file.path);
        }))
        .pipe(plugins.concat(config.buildFiles.app.js))
        .pipe(gulp.dest(config.buildDirectories.js));
});

// Build app.js and add to build directory (streamlined for build performance)
gulp.task('app-js-build-fast', ['app-js-clean'], function () {
    'use strict';
    return gulp.src(config.sourceDirectories.app.scripts + '**/*.js')
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.filter(function (file) {
            return /\.js$/.test(file.path) &&
                !/\.spec\.js/.test(file.path);
        }))
        .pipe(plugins.concat(config.buildFiles.app.js))
        .pipe(gulp.dest(config.buildDirectories.js));
});

// Optimize app.js and add to build directory
gulp.task('app-js-build-optimize', ['app-js-build'], function () {
    'use strict';
    return gulp.src(config.buildDirectories.js + config.buildFiles.app.js)
        .pipe(plugins.plumber({ handleError: errorHandler }))
        .pipe(plugins.clean())
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.buildDirectories.js));
});

// Build all JavaScript files for local development environment
gulp.task('build-scripts', ['lib-js-build', 'app-js-build', 'head-js-build']);

// Build all JavaScript files for local development environment (streamlined for build performance)
gulp.task('build-scripts-fast', ['lib-js-build', 'app-js-build-fast', 'head-js-build']);

// Add watch for local development environment
gulp.task('watch-scripts', function () {
    'use strict';
    gulp.watch(config.sourceDirectories.app.scripts + '**/*.js', ['build-scripts']);
});

// Build optimized JavaScript files for deployment to non-local environment (qa, staging, production)
gulp.task('build-scripts-optimize', ['lib-js-build-optimize', 'app-js-build-optimize', 'head-js-build-optimize']);



/* -----------------------------------------------------------------------------------------------
 * BUILD TASKS
 */

// Build for local development environment
gulp.task('build-dev', ['build-scripts', 'build-fonts', 'build-styles']);

// Build for local development environment with watches enabled
gulp.task('build-dev-watch', ['build-scripts', 'build-fonts', 'build-styles', 'watch-scripts', 'watch-styles']);

// Build for local development environment (streamlined for build performance)
gulp.task('build-fast', ['build-scripts-fast', 'build-fonts', 'build-styles']);

// Build for deployment to non-local environment (qa, staging, production)
gulp.task('build-deploy', ['build-scripts-optimize', 'build-fonts', 'build-styles-optimize']);

// Default task
gulp.task('default', ['bower']);
