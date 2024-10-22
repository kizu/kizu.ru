import initPrism from './prism.js';
import initPjax from './pjax.js';
import search from './search.js';
import initBlockLinks from './blockLinks';
import initWebComponents from './webComponents';
import { IdleQueue } from 'idlize/IdleQueue.mjs';

window.mySearch = search;

const queue = new IdleQueue({ ensureTasksRun: true });
const lazyQueue = new IdleQueue();

lazyQueue.pushTask(initWebComponents);
window.Prism = window.Prism || {};
Prism.manual = true;
Prism.disableWorkerMessageHandler = true;
lazyQueue.pushTask(initPrism);
lazyQueue.pushTask(() => initBlockLinks('.ArticleList-Item'));
lazyQueue.pushTask(() => initPjax(queue, lazyQueue));

// Hey, Safari, maybe only load Prism after 10 seconds???
if (!('requestIdleCallback' in window) && document.location.pathname === '/tree-counting-and-random/') {
  console.log('Ooops, running Prism freezes the page on this URL. I am investigating, but for now Prism is disabled here.')
} else {
  lazyQueue.pushTask(() => Prism.highlightAll());
}
