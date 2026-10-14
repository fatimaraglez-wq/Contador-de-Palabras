const path = require("path");

module.exports = {
    mode: "development",

    entry: "./public/js/index.js",

    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },

    devServer: {
        static: {
            directory: __dirname
        },
        port: 8080
    }
};
