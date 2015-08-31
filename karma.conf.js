module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        plugins: [
            'karma-phantomjs-launcher',
            'karma-chai',
            'karma-chai-sinon',
            'karma-sinon',
            'karma-mocha',
            'karma-mocha-reporter',
            'karma-sourcemap-loader',
            'karma-webpack'
        ],
        frameworks: ['mocha', 'chai', 'chai-sinon'],
        reporters: ['mocha'],
        files: [
            'test/client/test-bundle.js'
        ],
        preprocessors: {
            'test/client/test-bundle.js': ['webpack', 'sourcemap']
        },
        logLevel: config.LOG_WARN,
        webpack: {
            // karma watches the test entry points
            // (you don't need to specify the entry option)
            // webpack watches dependencies
            devtool: 'inline-source-map',
            module: {
                loaders: [{
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    test: /\.js$/
                }]
            }
        },
        webpackMiddleware: {
            noInfo: true
        }
    })
};