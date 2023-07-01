import './prism.js';
import initPjax from './pjax.js';
import search from './search.js';
import myFonts from './myfonts';
import initBlockLinks from './blockLinks';
import initWebComponents from './webComponents';
import initAnalytics from './metrika';
import { IdleQueue } from 'idlize/IdleQueue.mjs';

window.mySearch = search;

const queue = new IdleQueue({ ensureTasksRun: true });
const lazyQueue = new IdleQueue();

initPjax(queue, lazyQueue);

initBlockLinks('.ArticleList-Item');

initWebComponents();

queue.pushTask(() => {
  initAnalytics('UA-3692077-1');
});
queue.pushTask(() => myFonts('306f31'));
