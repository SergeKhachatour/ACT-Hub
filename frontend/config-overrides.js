const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
    if (!config.resolve) {
        config.resolve = {};
    }

    // Add externals configuration
    config.externals = {
        ...config.externals,
        eventsource: 'eventsource'
    };

    config.resolve.fallback = {
        ...config.resolve.fallback,
        vm: false,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
    };

    // Ignore source-map-loader warnings about missing source maps
    config.ignoreWarnings = [
        {
            module: /node_modules\/stellar-sdk/,
            message: /Failed to parse source map/,
        },
        // Add any other warnings you want to ignore
    ];

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
        // Ignore source map warnings for stellar-sdk
        new webpack.SourceMapDevToolPlugin({
            exclude: [/node_modules\/stellar-sdk/],
        }),
    ];

    return config;
}; 