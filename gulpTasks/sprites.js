import gulp from 'gulp';
import spritesmith from 'gulp.spritesmith';
import merge from 'merge2';
import buffer from 'vinyl-buffer';

import { $, tplConf, tplSrc, assets, PRODUCTION } from './config';

export const sprites = () => {
    // Generate our spritesheet
    const spriteData = gulp.src(tplSrc('sprites'))
        .pipe(spritesmith({
            imgName: 'sprite_1.png',
            cssName: '_sprites.scss',
            padding: 5
        }));
    // Pipe image stream through image optimizer and onto disk
    const imgStream = spriteData.img
        // DEV: We must buffer our stream into a Buffer for `imagemin`
        .pipe(buffer())
        .pipe($.imagemin())
        .pipe(gulp.dest(tplConf.dest.img));
    // Pipe CSS stream through CSS optimizer and onto disk
    const scssStream = spriteData.css
        .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
        .pipe(gulp.dest(assets + 'scss'));
    // Return a merged stream to handle both `end` events
    return merge(imgStream, scssStream);
}
