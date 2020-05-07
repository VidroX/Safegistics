const withTM = require('next-transpile-modules')(['@material-ui/core', '@material-ui/icons']);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true'
});
const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([withTM, withBundleAnalyzer], {
    webpack: (config, { isServer }) => {
        config.resolve.extensions = [ '.mjs', '.tsx', '.ts', '.jsx', '.js', '.json', '.wasm' ];
        config.module.rules.push({
            test: /\.(graphql|gql)$/,
            exclude: /node_modules/,
            loader: 'graphql-tag/loader',
        });

        return config;
    },
});
