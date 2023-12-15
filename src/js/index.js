import './prism.js';
import initPjax from './pjax.js';
import search from './search.js';
import initBlockLinks from './blockLinks';
import initWebComponents from './webComponents';
import { IdleQueue } from 'idlize/IdleQueue.mjs';

window.mySearch = search;

const queue = new IdleQueue({ ensureTasksRun: true });
const lazyQueue = new IdleQueue();

initPjax(queue, lazyQueue);

initBlockLinks('.ArticleList-Item');

initWebComponents();
