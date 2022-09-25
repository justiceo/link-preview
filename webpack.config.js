// Run using `webpack --config webpack.config.js --env production`.
const { join } = require("path");
const webpack = require("webpack");

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
      ],
    },
    output: {
      path: join(__dirname, "./dist/audate"),
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
    ],
  };

  if (!env.production) {
    config.devtool = "inline-source-map";
  }
  return config;
};
