'use strict';

import { parallel, series, task, watch } from 'gulp';
import { tplSrc } from './gulpTasks/config';
import { sass } from './gulpTasks/sass';
import { images } from './gulpTasks/images';
import { javascript } from './gulpTasks/javascript';
import { sprites } from './gulpTasks/sprites';
import { server, _reload } from './gulpTasks/serve';
import { svgMaterialIcons, extractMateriaIcon } from './gulpTasks/materialIcons';
//import { cleanCss } from './gulpTasks/uncss';
//import { files } from './gulpTasks/copyFiles';

task('sass', sass);
task('js', javascript);
task('img', images);
task('sprites', sprites);
task('materialicons', series(extractMateriaIcon, svgMaterialIcons));

//task('files', files);
//task('deploy', parallel(files, 'sass'))

task('build', series(sprites, parallel('sass', javascript), images));

task('default',
    series(parallel(images, sprites), parallel(sass, javascript), server, observe));

task('scripts',
    series(parallel(sass, javascript), server, observe));

console.log(tplSrc('scss'))

function observe() {
    watch(tplSrc('scss')).on('all', series(sass, _reload));
    watch(tplSrc('js')).on('all', series(javascript, _reload));
    watch(tplSrc('img')).on('all', series(images, _reload));
    watch(tplSrc('sprites')).on('all', series(sprites, _reload));
}
