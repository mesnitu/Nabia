import gulp from 'gulp';
import autoprefixer from 'autoprefixer';
import { $, tplConf, scriptRename, tplSrc, PRODUCTION } from './config';
//import browserSync from 'browser-sync';


// Compile Sass into CSS. In production, the CSS is compressed
export const sass = () => {

    const postCssPlugins = [
        // Autoprefixer
        autoprefixer({ browsers: tplConf.browsers }),
    ].filter(Boolean);
    return gulp.src(tplSrc('scss'))
        .pipe($.sassGlob())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: tplConf.includeSassPaths
        }).on('error', $.sass.logError))
        .pipe($.postcss(postCssPlugins))
        .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe($.rename(function (path) {
            path.basename += '_' + scriptRename
        }))
        .pipe(gulp.dest(tplConf.dest.css))
    //.pipe(browserSync.reload({ stream: true })); //not working
}
