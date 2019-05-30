import { tplConf } from './config';
import browserSync from 'browser-sync';

const browser = browserSync.create();

export const server = (done) => {
  browser.init({
    proxy: tplConf.serverConfig.proxy,
    injectChanges: true,
    reloadDelay: 2000
  }, done);
}

// Reload the browser with BrowserSync
export const _reload = (done) => {
  //browser.reload({ stream: true }); //not working ....
  browser.reload();
  done();
}
