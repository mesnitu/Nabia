'use strict';

import fse from 'fs-extra';
import * as $ from './config';
import path from 'path';
import readdirp from 'readdirp';
import chalk from 'chalk';
import "@babel/polyfill";
import { util } from 'util';

// define some paths
const log = console.log
    , includesFolder = path.resolve($.siteFolder, 'includes')
    , templateFolder = path.resolve($.siteFolder, 'includes', 'templates')
    , nabiaFolder = path.resolve(templateFolder, $.tplName)
    , nabiaAppFolder = path.resolve(nabiaFolder, 'app')
    , assetsFolder = path.resolve(nabiaAppFolder, 'assets')
    , layoutsFolder = path.resolve(assetsFolder, 'layouts')
    , msgErr = chalk.bold.red
    , msgWarn = chalk.bold.keyword('orange')
    , msgOk = chalk.keyword('green')
    , msgInfo = chalk.bgBlue.black

// ensure that all "tplLayouts": [] have their folders in place
const ensureStreamletFiles = (layouts) => {

    log(msgOk('-> Do ensureStreamletFiles'))
    let streamlets = $.tplConf.tplLayouts;
    streamlets.forEach(streamlet => {
        let dir = path.join(layouts, streamlet)
        let file = path.join(dir, 'layout_files.json')
        if (!fse.pathExistsSync(file) ||
            !fse.pathExistsSync(path.join(dir, 'template')) ||
            !fse.pathExistsSync(path.join(dir, 'includes'))) {

            fse.ensureDirSync(path.join(dir, 'template'))
            log(`Created empty directory ${msgWarn('template')} for ${msgWarn(streamlet)}`)
            fse.ensureDirSync(path.join(dir, 'includes'))
            log(`Created empty directory ${msgWarn('includes')} for ${msgWarn(streamlet)}`)
            fse.outputJsonSync(file, [], { spaces: 4 })
            log(`Created ${msgWarn('layout_files.json')} for ${msgWarn(streamlet)}`)

        }
    })
}

// process on deploy
const processdeployfiles = (src, directoryFilter = null, dist) => {

    readdirp({ root: src, directoryFilter: directoryFilter })
        .on('data', (entry) => {
            //console.log(entry)
            _copyf(entry.fullPath, path.join(dist, entry.path))
            log(msgWarn(`Deploying ${entry.path} TO ${path.relative($.siteFolder, entry.fullPath)} ON ${directoryFilter}`))
        }).on('end', () => {
            log(msgOk(`Done in ${src}`))
        })

    //path.resolve(nabiaFolder, 'app', $.tplConf.deployFolder, $.streamletName)

}

const readtest = async (dir) => {

    return await readdirp({ root: dir })
        .on('data', (entry) => {

            log(msgOk(`[+] ${entry.path} --HERERER`))
            // add to project files
        }).on('error', error => console.error('fatal error', error))
        .on('end', () => {

        })

}

// process on copy / symlinks / remove
const processStreamletFiles = async (directory, layoutName) => {
    let dir = path.join(directory, 'template')
    let name = ($.deployfiles) ? layoutName : $.tplName
    var projectFiles = []
    // process the template files


    readdirp({ root: dir })
        .on('data', (entry) => {
            let d = path.join('includes', 'templates', name, entry.path);
            log(msgOk(`[+] ${entry.path} to ${name}`))
            // add to project files
            projectFiles.push(d)

            processFiles(entry.fullPath, path.resolve($.siteFolder, d))
        }).on('error', error => console.error('fatal error', error))
        .on('end', () => {

            fse.writeJSONSync(path.join($.tplAssetsStreamletFolder, 'layout_files.json'), projectFiles, { spaces: 2 })
        })
    console.log(projectFiles)

    dir = path.join(directory, 'includes')

    readdirp({ root: dir })
        .on('data', (entry) => {

            let d = path.join('includes', entry.path)
            // If not deploy, use the nabia name. Else use the streamlet name
            if (!$.deployfiles) {
                d = path.join('includes', entry.path.replace(layoutName, name))
            }
            log(msgOk(`[+] ${entry.path} to ${name}`))
            projectFiles.push(d)
            processFiles(entry.fullPath, path.resolve($.siteFolder, d))
        })
        .on('end', () => {
            log(msgOk('Done copying files!'))
            // Write the project files to json file
            fse.writeJSONSync(path.join($.tplAssetsStreamletFolder, 'layout_files.json'), projectFiles, { spaces: 2 })

            if ($.deployfiles) {
                log(msgInfo('## Deploying! ##'))
                // define the new streamlet path using the streamlet name
                let newStreamletPath = path.resolve(nabiaFolder, 'app', $.tplConf.deployFolder, $.streamletName)

                //Copy all template files excluding app folder
                processdeployfiles(nabiaFolder, ['!app'], path.join(newStreamletPath, 'dist', 'includes', 'templates', $.streamletName))
                //Copy all assets files excluding layouts folder
                processdeployfiles(assetsFolder, ['!layouts'], path.join(newStreamletPath, 'assets'))
            }
        }).on('error', error => console.error('fatal error', error))
}

/**
 * Process the files. 
 * @param {string} s - source 
 * @param {string} d -destiantion 
 */
const processFiles = (s, d) => {

    if ($.copyfiles) {
        _rmf(d)
        _copyf(s, d)
    }
    if ($.symlinkfiles) {
        // symlink files
        _linkf(s, d)
    }
    if ($.removefiles) {
        _rmf(d)
    }
}

const _rmf = d => fse.removeSync(d)

const _copyf = (s, d) => fse.copySync(s, d)

const _linkf = (s, d) =>
    fse.ensureSymlink(s, d, exists => {
        console.log(exists + ' -> [' + path.basename(d) + '] symlink exists') // => null
    })

// While developing, we are using the nabia template. After deploying alter the template name to the streamlet name
const alterTemplateInfo = (dist) => {

    // On deploy alter the template_info.php to rename the template name
    fse.readFile(path.join(nabiaFolder, 'template_info.php'), 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading template_info.php')
        } else {
            let newdata = data.replace('Nabia', $.streamletName)
            newdata.replace('mesnitu', '')
            fse.writeFile(path.join(dist, 'template_info.php'), newdata)
            console.log('->do template info')
        }
    })
}


export const files = async (done) => {

    log(msgInfo($.tplAssetsStreamletFolder + ' -- do files'))

    ensureStreamletFiles(layoutsFolder)
    //ensureStreamletFiles(layoutsFolder)

    const newStreamletPath = path.join(nabiaAppFolder, $.tplConf.deployFolder, $.streamletName)

    const rcName = checkLastStreamletUsage(path.join(nabiaAppFolder, '.nabiarc'), $.streamletName)
    console.log(rcName)
    log(msgWarn(`Streamlet: ${$.streamletName} || Previous: ${rcName}`))

    if (rcName === $.streamletName) {
        log(msgInfo('# Using streamlet %s #'), rcName);
    } else {

        let previousStreamLet = streamletFiles(path.join(layoutsFolder, rcName, 'layout_files.json'))
        log(msgWarn(previousStreamLet) + ' --Previsous Files')
        if (previousStreamLet) {

        }
        let wantedStreamLet = streamletFiles(path.join(layoutsFolder, $.streamletName, 'layout_files.json'))
        log(msgOk(wantedStreamLet) + ' --Current Files')

        writesnabiarc(path.join(nabiaAppFolder, '.nabiarc'), $.streamletName)

        log(`Removing files streamlet ${chalk.red(rcName)} adding ${chalk.blue($.streamletName)} files`);

        previousStreamLet.forEach(file => {

            log(msgWarn(`[-] ${file}`))
            _rmf(path.resolve($.siteFolder, file))
        });

    }

    let tt = await readtest(path.join($.tplAssetsStreamletFolder, 'template'))
    console.log(JSON.stringify(tt))
    processStreamletFiles($.tplAssetsStreamletFolder, $.streamletName)
    // IF deploy copy all the files to a deploy folder with the new streamlet name
    if ($.deployfiles) {
        console.log('DEPLOY')

        let streamletFiles
        try {
            streamletFiles = fse.readJSONSync(path.join($.tplAssetsStreamletFolder, 'layout_files.json'))

            let streamletFilesInclude = streamletFiles.filter(file => !file.includes('includes\\templates'))
            console.log(streamletFilesInclude, ' --streamletFilesInclude')

            streamletFilesInclude.forEach(file => {

                //log(path.join(newStreamletPath, 'dist', file))
                log(msgWarn(`Copy ${path.resolve($.siteFolder, file)} to ${path.join(newStreamletPath, 'dist', file)}`))
                //c:\xampp\htdocs\vhosts\promobv2.local\includes\templates\nabia\app\streamlets\off-canvas\dist\
                fse.copySync(path.resolve($.siteFolder, file.replace($.streamletName, $.tplName)), path.join(newStreamletPath, 'dist', file));

            });

        } catch (error) {
            log(msgErr('No layout files found!'))
        } finally {
            //remove previous nadia files. Let the stream flow
            streamletFiles.forEach(file => {
                let r = file.replace($.streamletName, $.tplName)
                log(msgWarn(r + ' --removing'))
                _rmf(path.resolve($.siteFolder, file.replace($.streamletName, $.tplName)))
            });
            alterTemplateInfo(path.join(templateFolder, $.tplConf.deployFolder, $.streamletName))
        }

    }

    done();
}

// at .nabiarc
const checkLastStreamletUsage = (path, data) => {
    console.log('do checkLastStreamletUsage')
    let streamlet

    if (fse.existsSync(path)) {
        try {
            streamlet = readNabiarc(path)
        } catch (error) {
            log(msgErr(error))
        }

    } else {
        streamlet = writesnabiarc(path, data)
        log(chalk.whiteBright.bgBlue.bold('Wrote %s'), data)
    }
    return streamlet
}


const streamletFiles = path => {
    return fse.readJSONSync(path);
}

const writesnabiarc = (path, data) => {
    console.log('do writesnabiarc')
    fse.writeFileSync(path, data.toString())
}

const readNabiarc = (path) => {

    let r = fse.readFileSync(path).toString()
    if (r.length == 0) {
        log(msgErr('Unable to determinate last streamlet!'))
        r = $.streamletName
        writesnabiarc(path, r)
    }
    return r
}
