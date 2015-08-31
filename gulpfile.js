var gulp = require('gulp'),
    webpack = require('webpack'),
    path = require('path'),
    fs = require('fs'),
    DeepMerge = require('deep-merge'),
    nodemon = require('nodemon'),
    less = require('gulp-less'),
    babel = require('babel/register'),
    mocha = require('gulp-mocha'),
    karma = require('karma'),
    spawn = require('child_process').spawn,
    gutil = require('gulp-util');



var deepmerge = DeepMerge(function(target, source, key) {
    if (target instanceof Array) {
        return [].concat(target, source);
    }
    return source;
});

// this is a workaround for Windows where child_process can't find the gulp executable
var gulpCmd = process.platform === 'win32' ? 'gulp.cmd' : 'gulp';
var karmaServer;

/************** Generic Webpack config *************************/

var defaultConfig = {
    module: {
        preLoaders: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            loader: 'eslint-loader'
        }],
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            loaders: ['babel']
        }]
    },
    eslint: {
        emitError: true,
        failOnError: true,
        formatter: require('eslint-friendly-formatter')
    }
};

if (process.env.NODE_ENV !== 'production') {
    defaultConfig.devtool = 'inline-source-map';
    defaultConfig.debug = true;
}

function config(overrides) {
    return deepmerge(defaultConfig, overrides || {});
}

/************** Front End config *************************/


var frontendConfig = config({
    entry: ['./views/viewjs/main.js'],
    output: {
        path: path.join(__dirname, 'public/js'),
        filename: 'client.js'
    }
});

/************** Back End config *************************/

// we are ignoring node_modules on the server build using this trick
var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;

    });

// ignore babel polyfill
nodeModules['babel-core/polyfill'] = 'commonjs ' + 'babel-core/polyfill';

var backendConfig = config({
    entry: ['babel-core/polyfill', './app.js'],
    target: 'node',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'server.js'
    },
    node: {
        __dirname: true,
        __filename: true
    },
    externals: nodeModules,
    plugins: [
        new webpack.IgnorePlugin(/\.(css|less)$/),
        new webpack.BannerPlugin('require("source-map-support").install();', {
            raw: true,
            entryOnly: false
        })
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['babel']
        }]
    }
});

/************  Helper Tasks ******************/


function onWebpackBuild(done) {
    return function(err, stats) {
        var color;
        if (err) {
            console.log(gutil.colors.red('FATAL ERROR', err));
        } else {
            color = stats.hasErrors() ? 'red' : 'green';
            gutil.log(gutil.colors.cyan('********* Webpack build stats *************'));
            gutil.log(gutil.colors[color](stats.toString()));
            gutil.log(gutil.colors.cyan('*******************************************'));
        }

        done && done();
    }
}

// build tasks
gulp.task('frontend-build', function(done) {
    webpack(frontendConfig).run(onWebpackBuild(done));
});

gulp.task('backend-build', function(done) {
    webpack(backendConfig).run(onWebpackBuild(done));
});

// watch tasks
function setupWebpackFrontEndWatch() {
    webpack(frontendConfig).watch(200, function(err, stats) {
        onWebpackBuild()(err, stats);
        var karmaRunnerProcess;
        if (!err && !stats.hasErrors()) {
            // whenever a build is successfully completed, we execute karma single run through a gulp task
            // using a child process (since karma kills the webpack watch when exiting)
            spawnKarmaRun();
        }
    });
}

gulp.task('frontend-watch', function() {

    karmaServer = startKarma();

    karmaServer.on('browsers_ready', function() {
        setupWebpackFrontEndWatch();
    });

    // recompile LESS on change
    gulp.watch(['./public/less/**/*.less'], ['less']);
});

gulp.task('backend-watch', function() {
    webpack(backendConfig).watch(100, function(err, stats) {
        onWebpackBuild()(err, stats);

        // we restart the node app only when the build has been completely successfully and
        // tests are passing
        var stream, isTestSuiteFailing;
        if (!err && !stats.hasErrors()) {
            gutil.log('Running task', gutil.colors.cyan('test-server'));
            stream = runMocha();
            isTestSuiteFailing = false;

            stream.on('error', function() {
                isTestSuiteFailing = true;
                this.emit('end');
            });

            stream.on('end', function() {
                if (!isTestSuiteFailing) {
                    gutil.log('Test completed, restarting the node app');
                    nodemon.restart();
                }
                gutil.log('Finished task', gutil.colors.cyan('test-server'));
            });
        }
    });
});


/************** LESS build *************************/

gulp.task('less', function() {

    return gulp.src('./public/less/site.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less')]
        }))
        .on('error', function(error) {
            console.log(error.toString());
            this.emit('end');
        })
        .pipe(gulp.dest('./public/css'));
});

/************** Server Tests *************************/

function runMocha() {
    return gulp.src(['test/server/**/*.js'])
        .pipe(mocha({
            compilers: {
                js: babel
            }
        })).on('error', function(err) {
            this.emit('end');
        });
}

gulp.task('test-server', function() {
    gutil.log('Running' + gutil.colors.cyan('test-server task'));
    return runMocha();
});

/************** Client Tests *************************/

function spawnKarmaRun() {

    gutil.log('Running task karma:run');

    var karmaRunnerProcess = spawn(gulpCmd, ['karma:run'], {
        cwd: process.cwd()
    });

    karmaRunnerProcess.on('exit', function() {
        gutil.log('Finished task karma:run');
    });
}

function startKarma(done) {
    var server = new karma.Server({
        configFile: path.join(__dirname, '/karma.conf.js'),
        singleRun: false,
        autoWatch: false
    }, done);

    server.start();
    return server;
}

gulp.task('karma:start', function(done) {
    return startKarma(done);

});

gulp.task('karma:run', function(done) {
    karma.runner.run({
        configFile: path.join(__dirname, '/karma.conf.js')
    }, done);
});

/************** Main Tasks *************************/

gulp.task('test-watch', function() {
    gulp.watch(['test/server/**/*.js'], ['test-server']);
    gulp.watch(['test/client/**/*.js'], function() {
        spawnKarmaRun();
    });
});

gulp.task('watch', ['backend-watch', 'frontend-watch', 'test-watch'], function() {
    nodemon({
        execMap: {
            js: 'node'
        },
        script: path.join(__dirname, 'build/server'),
        ignore: ['!*.ejs'],
        ext: 'ejs'
    }).on('restart', function() {
        gutil.log(gutil.colors.green('Server restarted!'));
    });
});

gulp.task('build', ['backend-build', 'frontend-build', 'less']);
gulp.task('default', ['watch']);