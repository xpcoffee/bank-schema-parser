const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  target: "node",
  externals: [],
  plugins: [],
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: "bank-schema-parser",
    libraryTarget: "umd",
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
