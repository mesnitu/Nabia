import { tplConf, assets, $, tplSrc } from './config';
import { dest, src } from "gulp";

export const extractMateriaIcon = () => {
    const tasks = require('.' + assets + 'icons.json')
    return $.materialIcons({ tasks: tasks })
        .pipe(dest(assets + 'svgs'));
}

export const svgMaterialIcons = () => {
    const config = {
        shape: {
            dimension: {
                maxWidth: 24,
                maxHeight: 24,
                attributes: true
            },
            spacing: {
                padding: 5
            }
        },
        mode: {
            symbol: {
                dest: "symbol",
                bust: true,
                inline: true,
                example: true
            }
        }
    }
    // const baseDir = tplSrc('svgs')  // <-- Set to your SVG base directory
    // const svgGlob = '**/*.svg'    // <-- Glob to match your SVG files
    // const outDir = tplConf.dest.svgs   // <-- Main output directory

    return src('**/*.svg', { cwd: tplSrc('svgs') })
        .pipe($.plumber())
        .pipe($.svgSprite(config)).on('error', function (error) { console.log(error); })
        .pipe(dest(tplConf.dest.svgs));
}
