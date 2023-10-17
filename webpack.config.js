const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const fs = require("fs");

const entries = ["ryd.content-script", "ryd.background", "popup"];
const banner = `
// ==UserScript==
// @name         Return YouTube Dislike
// @namespace    https://www.returnyoutubedislike.com/
// @homepage     https://www.returnyoutubedislike.com/
// @version      3.1.2
// @encoding     utf-8
// @description  Return of the YouTube Dislike, Based off https://www.returnyoutubedislike.com/
// @icon         https://github.com/Anarios/return-youtube-dislike/raw/main/Icons/Return%20Youtube%20Dislike%20-%20Transparent.png
// @author       Anarios & JRWR
// @match        *://*.youtube.com/*
// @exclude      *://music.youtube.com/*
// @exclude      *://*.music.youtube.com/*
// @compatible   chrome
// @compatible   firefox
// @compatible   opera
// @compatible   safari
// @compatible   edge
// @downloadURL  https://github.com/Anarios/return-youtube-dislike/raw/main/Extensions/UserScript/Return%20Youtube%20Dislike.user.js
// @updateURL    https://github.com/Anarios/return-youtube-dislike/raw/main/Extensions/UserScript/Return%20Youtube%20Dislike.user.js
// @grant        GM.xmlHttpRequest
// @connect      youtube.com
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==
`;

const ignorePatterns = [
  "**/manifest-**",
  "**/dist/**",
  "**/src/**",
  "**/readme.md",
  ...entries.map((entry) => `**/${entry}.ts`),
];

module.exports = {
  entry: Object.fromEntries(
    entries.map((entry) => [
      entry,
      path.join(__dirname, "./Extensions/combined/", `${entry}.ts`),
    ])
  ),
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "Extensions/combined/dist"),
    clean: true,
  },
  optimization: {
    minimize: false,
  },
  watchOptions: {
    ignored: "**/dist/**",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules|Website/,
      },
    ],
  },
  plugins: [
    // exclude locale files in moment
    new CopyPlugin({
      patterns: [
        {
          from: "./Extensions/combined",
          to: "./chrome",
          globOptions: {
            ignore: ignorePatterns,
          },
        },
        {
          from: "./Extensions/combined/manifest-chrome.json",
          to: "./chrome/manifest.json",
        },
        {
          from: "./Extensions/combined",
          to: "./firefox",
          globOptions: {
            ignore: ignorePatterns,
          },
        },
        {
          from: "./Extensions/combined/manifest-firefox.json",
          to: "./firefox/manifest.json",
        },
        {
          from: "./Extensions/combined",
          to: "./safari",
          globOptions: {
            ignore: ignorePatterns,
          },
        },
        {
          from: "./Extensions/combined/manifest-safari.json",
          to: "./safari/manifest.json",
        },
      ],
    }),
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              source: "./Extensions/combined/dist/**.js",
              destination: "./Extensions/combined/dist/firefox/",
            },
            {
              source: "./Extensions/combined/dist/**.js",
              destination: "./Extensions/combined/dist/chrome/",
            },
            {
              source: "./Extensions/combined/dist/**.js",
              destination: "./Extensions/combined/dist/safari/",
            },
            {
              source: "./Extensions/combined/dist/ryd.content-script.js",
              destination:
                "./Extensions/combined/dist/UserScript/Return Youtube Dislike.user.js",
            },
          ],
          delete: [
            {
              source: "./Extensions/combined/dist/**.js",
            },
          ],
        },
      },
    }),
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tapAsync(
          "PrependBannerPlugin",
          (compilation, callback) => {
            const userScript = path.resolve(
              __dirname,
              "./Extensions/combined/dist/UserScript/Return Youtube Dislike.user.js"
            );
            console.log(userScript);
            if (fs.existsSync(userScript)) {
              console.log("Writing banner to", userScript);
              const originalContent = fs.readFileSync(userScript, "utf-8");
              fs.writeFileSync(userScript, banner + originalContent);
            } else {
              console.error("File does not exist", userScript);
            }

            callback();
          }
        );
      },
    },
  ],
};
