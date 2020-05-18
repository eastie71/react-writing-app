const currentTask = process.env.npm_lifecycle_event
const path = require("path")
const Dotenv = require("dotenv-webpack")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const fse = require("fs-extra")

/*
  Because I didn't bother making CSS part of our
  webpack workflow for this project I'm just
  manually copying our CSS file to the DIST folder. 
*/
class RunAfterCompile {
    apply(compiler) {
        compiler.hooks.done.tap("Copy files", function () {
            fse.copySync("./app/main.css", "./dist/main.css")

            /*
        If you needed to copy another file or folder
        such as your "images" folder, you could just
        call fse.copySync() as many times as you need
        to here to cover all of your files/folders.
      */
        })
    }
}

config = {
    entry: "./app/Main.js",
    output: {
        publicPath: "/",
        path: path.resolve(__dirname, "app"),
        filename: "bundled.js"
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "app/index-template.html",
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin()
    ],
    mode: "development",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react", ["@babel/preset-env", { targets: { node: "12" } }]]
                    }
                }
            }
        ]
    }
}

// historyApiFallback -> index.html is so that when the browser requests a specific page it ALWAYS
// re-directs to the "index.html" page - and react will handle the routing
if (currentTask == "webpackDev" || currentTask == "dev") {
    config.devtool = "source-map"
    config.devServer = {
        port: 3000,
        contentBase: path.join(__dirname, "app"),
        hot: true,
        historyApiFallback: { index: "index.html" }
    }
}

if (currentTask == "webpackBuild") {
    config.plugins.push(new CleanWebpackPlugin(), new RunAfterCompile())
    config.mode = "production"
    config.output = {
        publicPath: "/",
        path: path.resolve(__dirname, "dist"),
        filename: "[name].[chunkhash].js",
        chunkFilename: "[name].[chunkhash].js"
    }
}

module.exports = config
