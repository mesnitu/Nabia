import gulp from 'gulp';
import { PRODUCTION, $, tplConf, tplSrc } from './config';

// Copy images to the "dist" folder. In production, the images are compressed
export const images = () => {
  return gulp.src(tplSrc('img'))
    .pipe($.if(PRODUCTION, $.imagemin([
      $.imagemin.jpegtran({ progressive: tplConf.imgConfig.jpgProgressive })
    ])))
    .pipe(gulp.dest(tplConf.dest.img));
}
