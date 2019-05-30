//import uncss from 'uncss';
import gulp from 'gulp';
import uncss from 'postcss-uncss';

import * as config from './config';


const configUncss = config.$.if(config.PRODUCTION, uncss({
    html: config.htmlUncss,
    ignore: [
        new RegExp('^meta\..*'),
        new RegExp('^\.is-.*')
    ]
}));

export function cleanCss() {
    var plugins = [
        uncss({
            html: [config.tc.htmlUncss]
        }),
    ];
    return gulp.src(config.tc.dist.css + '/*.css')
        .pipe(config.$.postcss(plugins))
        .pipe(gulp.dest('../desti'));
};
