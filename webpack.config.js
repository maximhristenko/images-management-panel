var webpack = require('webpack'),
    ReloadPlugin = require('webpack-reload-plugin'),
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    WebpackNotifierPlugin = require('webpack-notifier'),
    StyleLintPlugin = require('stylelint-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

/**
 * Support for extra commandline arguments
 */
var argv = require('optimist')
    .alias('r', 'release').default('r', false)
    .argv;

/**
 * Useful variables
 */
var cwd = process.cwd();
var DEBUG = !argv.release;
var isDevServer = process.argv.join('').indexOf('webpack-dev-server') > -1;
var version = require(path.resolve(cwd, 'package.json')).version;
var reloadHost = "0.0.0.0";
var npmRoot = __dirname + "/node_modules";
var appDir = __dirname + "/app";

var entry = ["./app/ts/app.ts"];


if (isDevServer) {
    entry.unshift("webpack-dev-server/client?http://" + reloadHost + ":8080");

}

function makeConfig(options) {
    return {
        cache: true,
        debug: true,
        verbose: true,
        displayErrorDetails: true,
        displayReasons: true,
        displayChunks: false,
        context: __dirname,
        entry: {
            vendor: './app/ts/vendor.ts',
            app: entry
        },
        noInfo: true,
        quiet: true,
        stats: {
            colors: true,
            reasons: DEBUG,
            chunks: false,
            chunkModules: false,
            modules: false,
            errorDetails: true
        },
        devtool: 'source-map',
        recordsPath: path.resolve('.webpack.json'),
        devServer: {
            inline: true,
            colors: true,
            contentBase: path.resolve(cwd, "build"),
            publicPath: "/"
        },
        output: {
            path: path.resolve(cwd, "build"),
            filename: "[name].js",
            publicPath: "/", // isDevServer ? './': './',
            chunkFilename: "[id].bundle.js",

            // Hot Module Replacement settings:
            hotUpdateMainFilename: "updates/[hash].update.json",
            hotUpdateChunkFilename: "updates/[hash].[id].update.js"
        },
        plugins: [
            new webpack.IgnorePlugin(/spec\.js$/),
            new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.js', minChunks: Infinity}),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'common',
                filename: 'common.js',
                minChunks: 2,
                chunks: ['app', 'vendor']
            }),
            new ExtractTextPlugin("styles.css"),
            new webpack.DefinePlugin({
                VERSION: JSON.stringify(version),
                ENV: JSON.stringify(options.env)
            }),
            new StyleLintPlugin({
                configFile: '.stylelintrc',
                files: ['**/*.s?(a|c)ss'],
                failOnError: false
            }),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: path.join(appDir, "index.html")
            }),
            new ReloadPlugin(isDevServer ? 'localhost' : ''),
            new WebpackNotifierPlugin({
                title: "ng-book"
                // contentImage: path.join(appDir, 'images/notifier.png')
            }),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                jquery: "jquery",
                "window.jQuery": "jquery"
            })
        ],
        resolveLoader: {
            root: path.join(__dirname, 'node_modules'),
            modulesDirectories: ['node_modules'],
            fallback: path.join(__dirname, "node_modules")
        },
        resolve: {
            root: [path.resolve(cwd)],
            modulesDirectories: [
                'node_modules', 'app', 'app/ts', '.'
            ],
            extensions: ["", ".ts", ".js", ".json", ".css"],
            alias: {
                // 'rx': '@reactivex/rxjs',
                'app': 'app',
                'scripts': npmRoot,
                'jquery': path.join(__dirname, 'node_modules/jquery/dist/jquery.min')

            }
        },
        module: {
            preLoaders: [
                {test: /\.ts$/, loader: "tslint"}
            ],

            loaders: [
                {test: /\.(png|jpg|gif)$/, loader: "url-loader?limit=50000&name=[path][name].[ext]"},
                {test: /\.json$/, loader: 'json'},
                {
                    test: /^(?!.*\.min\.css$).*\.css$/,
                    loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap")
                },
                {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader"},
                {test: /\.html$/, loader: "raw"},
                {test: /^index\.html$/, loader: "file-loader?name=[path][name].[ext]"},
                {test: /\.ts$/, loader: 'ts'},
                //  { test: /\.ts$/, loader: 'ts', exclude: [ /test/, /node_modules/]},
                {
                    test: /vendor\/.*\.(css|js)/,
                    loader: 'file-loader?name=[path][name].[ext]',
                    exclude: [/node_modules/]
                },
                {
                    test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "file-loader?mimetype=application/font-woff&name=[path][name].[ext]"
                },
                {
                    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "file-loader?mimetype=application/x-font-ttf&name=[path][name].[ext]"
                },
                {
                    test: /\.eot(\?v=\d+\.\d+\.\d+)?\??$/,
                    loader: "file-loader?mimetype=application/vnd.ms-fontobject&name=[path][name].[ext]"
                },
                {
                    test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "file-loader?mimetype=application/font-otf&name=[path][name].[ext]"
                },
                {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader"},
                {
                    test: /\.less$/,
                    loader: "style-loader!css-loader!less-loader"
                },
                {
                    test: /\.scss$/,
                    loaders: ["style-loader", "css-loader", "sass-loader"]
                }
            ],
            noParse: [
                /\.min\.js/,
                /vendor[\/\\].*?\.(js|css)$/
            ]
        },
        sassLoader: {
            includePaths: [path.resolve(__dirname, "./app/css")]
        },
        tslint: {
            emitErrors: false,
            failOnHint: false
        }
    }
}

var config = makeConfig(argv);

//console.log(require('util').inspect(config, {depth: 10}))
module.exports = config;
