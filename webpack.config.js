const path = require("path")

// historyApiFallback -> index.html is so that when the browser requests a specific page it ALWAYS
// re-directs to the "index.html" page - and react will handle the routing
module.exports = {
    entry: "./app/Main.js",
    output: {
        publicPath: "/",
        path: path.resolve(__dirname, "app"),
        filename: "bundled.js"
    },
    mode: "development",
    devtool: "source-map",
    devServer: {
        port: 3000,
        contentBase: path.join(__dirname, "app"),
        hot: true,
        historyApiFallback: { index: "index.html" }
    },
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
