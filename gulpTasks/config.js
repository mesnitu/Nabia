'use strict';

import plugins from 'gulp-load-plugins';
import yargs from 'yargs';
import path from 'path';

export function err(m) {
    throw new Error(m)
}

// set template config export vars
export const tplConf = require('../template.config.json'),
    // get template config
    assets = tplConf.assetsFolder,
    tplName = tplConf.templateName.toLowerCase(),
    $ = plugins(), // gulp plugins
    // Check for --production flag
    PRODUCTION = !!(yargs.argv.production)

export let replaceName = tplName,
    streamletName,
    tplAssetsStreamletFolder,
    copyfiles,
    deployfiles,
    removefiles,
    symlinkfiles

if (yargs.argv._[0] == 'files') {
    // symlink , copy, deploy, remove
    yargs.command('files', 'Handles Streamlet files', (yargs) => {
        return yargs.option('layout', {
            alias: 'l',
            describe: 'The Streamlet name',
            choices: tplConf.tplLayouts,
            type: 'string',
            demandOption: true,
        }).option('task', {
            alias: 't',
            describe: 'Chose the task for the layout',
            choices: ['copy', 'remove', 'symlink', 'deploy', 'init'],
            type: 'string',
            demandOption: true
        })
    }, (argv) => {

        tplAssetsStreamletFolder = path.resolve(assets, 'layouts', argv.l)

        switch (argv.t) {
            case 'copy':
                copyfiles = true
                break;
            case 'remove':
                removefiles = true
                break;
            case 'symlink':
                symlinkfiles = true
                break;
            case 'deploy':
                // IF deploy, use the streamlet name. else use nabia name
                replaceName = argv.l
                copyfiles = true
                deployfiles = true
                break;
            default:
                break;
        }
    }).check(argv => {
        if (argv.l) {
            return true;
        } else {
            throw (new Error('Argument check failed'));
        }
    }).help().argv

    streamletName = path.basename(tplAssetsStreamletFolder)
}

export let scriptRename = tplConf.version + '-' + replaceName

// define the streamlet name based on chosen one


console.log(`ReplaceName: ${replaceName}, ScriptName: ${scriptRename}`)

/** 
 * Find a set the site folder path, is: c:\xampp\htdocs\vhosts\sitefolder.local
 * All symlinks and copy files will be related to siteFolder.
 * All php files found in app/assets/layouts/{layout}/ will be linked / copied maintaining the same folder structure
*/
const dirName = path.resolve(__dirname);
export const siteFolder = path.resolve(dirName.split(tplConf.siteFolder)[0], tplConf.siteFolder);

// // extract src assets path
export let tplSrc = (scope) => {
    // build src assets path
    const getSources = Object.getOwnPropertyNames(tplConf.src),
        getSourcesValues = Object.values(tplConf.src);

    for (var i in getSources) {
        if (getSources[i] === scope) {
            return assets + getSourcesValues[i]
        }
    }
}
