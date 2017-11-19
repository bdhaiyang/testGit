import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import path from 'path';
import customs from './titles';

export default function getConfig({name, html = {}, px2rem = {}, framework = 'jquery'}) {

  // HTML
  const defaultHtmlConfig = customs[name] || {};
  const htmlConfig = {...defaultHtmlConfig, ...html};
  htmlConfig.template = htmlConfig.template || `src/_commons/tpl/${framework}Tpl.hbs`;

  // px2rem
  const px2remConfig = {
    remUnit     : 75,
    remPrecision: 8,
    ...px2rem
  };

  return {
    externals: {
      jquery     : 'jQuery',
      react      : 'React',
      'react-dom': 'ReactDOM',
      vue        : 'Vue',
    },
    output   : {
      path      : path.resolve(__dirname, '../tmp'),
      filename  : `assets/js/${name}_[name].js`,
      publicPath: '/fe/'
      // publicPath: 'http://127.0.0.1:8080/'
    },
    devtool  : "#cheap-module-source-map",
    module   : {
      noParse: [
        'jquery',
        'react',
        'react-dom',
        'vue',
      ],
      loaders: [
        {
          test   : /\.(vue)$/,
          exclude: /(node_modules|bower_components)/,
          loaders: ["vue-loader"],
        },
        {
          test   : /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          loader : "babel-loader",
        },
        {
          test  : /\.(png|jpg|gif|jpeg)$/,
          loader: "url-loader",
          query : {
            name : `assets/img/${name}_[hash:8].[ext]`,
            limit: 8192
          }
        },
        {
          test  : /\.(handlebars|hbs)$/,
          loader: "handlebars-loader",
          query : {
            inlineRequires: '\/images\/'
          }
        },
        {
          test  : /\.(html)$/,
          loader: "html-loader"
        },
        {
          test  : /\.(ttf|eot|svg)$/,
          loader: "url-loader?limit=100000"
        },
        {
          test  : /\.less$/,
          loader: ExtractTextPlugin.extract(["css", "px2remless?" + JSON.stringify(px2remConfig), "postcss-loader", "less"])
        },
        {
          test  : /\.css$/,
          loader: ExtractTextPlugin.extract(["css", "px2remless?" + JSON.stringify(px2remConfig), "postcss-loader"])
        }
      ]
    },

    vue: {
      loaders: {
        css: ExtractTextPlugin.extract(["css", "px2remless?" + JSON.stringify(px2remConfig), "postcss-loader"]),
        less: ExtractTextPlugin.extract(["css", "px2remless?" + JSON.stringify(px2remConfig), "postcss-loader", "less"])
      }
    },

    postcss: function () {
      return [autoprefixer];
    },

    plugins: [
      new ExtractTextPlugin(`assets/css/${name}_[name].css`),
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        filename: `html/${name}.html`,
        ...htmlConfig,
      })
    ]
  }
};
