import gulp from 'gulp';
import named from 'vinyl-named';
import webpackStream from 'webpack-stream';
import webpack2 from 'webpack';

import { tplConf, assets, scriptRename, $, PRODUCTION } from './config';
// Combine JavaScript into one file
// In production, the file is minified

let webpackConfig = {
    mode: (PRODUCTION ? 'production' : 'development'),
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env"],
                        compact: false
                    }
                }
            }
        ]
    },
    devtool: !PRODUCTION && 'source-map'
};

export const javascript = () => {

    return gulp.src(assets + tplConf.entries)
        .pipe(named())
        .pipe($.sourcemaps.init())
        .pipe(webpackStream(webpackConfig, webpack2))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => { console.log(e); })))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe($.rename(function (path) {
            path.basename = 'jscript_' + scriptRename
            //path.basename += '_' + scriptRename; // rename and add version
        }))
        .pipe(gulp.dest(tplConf.dest.js));
}
