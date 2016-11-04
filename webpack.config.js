var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    context: __dirname,
    entry: "./src/index-dev.js",
    output: {
        path: __dirname + "/dist",
        filename: "react-board-layout.js",
        libraryTarget: "umd",
        library: "react-board-layout"
    },
    externals: {
        "react" : {
            "amd" : "react"
        },
        "react-dom" : {
            "amd" : "react-dom"
        },
        "lodash" : {
            "amd" : "lodash"
        }
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            }
        ]
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     "process.env": {
        //         NODE_ENV: JSON.stringify("production")
        //     }
        // })
        new ExtractTextPlugin("styles.css")
    ],
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    }
};
