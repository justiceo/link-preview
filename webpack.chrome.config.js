// Run using `webpack --config webpack.chrome.config.js --env production`.
const { join } = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env) => {
  let mode = "development";
  let envFilePath = "../environments/environment.ts";
  if (env.production) {
    mode = "production";
    envFilePath = "../environments/environment.prod.ts";
  }

  const config = {
    mode: mode,
    entry: {
      "content-script": join(__dirname, "src/chrome/content-script.ts"),
      "service-worker": join(__dirname, "src/chrome/service-worker.ts"),
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: "tsconfig.chrome.json",
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { sourceMap: true } },
          ],
        }
      ],
    },
    output: {
      path: join(__dirname, "./dist/search-preview"),
      filename: "[name].js",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(
        /src\/environments\/environment\.ts/,
        envFilePath
      ),
      new MiniCssExtractPlugin({
        filename: 'floatie.css'
      }),
    ],
  };

  if (!env.production) {
    config.devtool = "inline-source-map";
  }
  return config;
};
