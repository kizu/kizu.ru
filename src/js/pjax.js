import { getToCMethods } from './toc.js';

const initPjax = (queue, lazyQueue) => {
  const { registerToC, unregisterToC } = getToCMethods();
  registerToC();

  const states = {};
  const html = document.documentElement;

  const getURL = url => url || (new URL(window.location.href)).pathname;

  let versions = { en: {}, ru: {} };
  let currentURL = getURL();
  let shouldApplyPopState = true;

  const getCurrentState = () => {
    const typeMatch = html.className.match(/Page_type_(\w*)/);
    const rootElement = document.getElementsByClassName('Root')[0];

    return {
      title: document.title,
      domRoot: rootElement,
      lang: html.getAttribute('lang'),
      type: typeMatch && typeMatch[1],
      url: currentURL
    }
  };

  states[currentURL] = getCurrentState();

  const applyStateDOM = state => {
    unregisterToC();
    const oldRoot = document.getElementsByClassName('Root')[0];
    if (!state.domRoot) {
      const newRoot = document.createElement('div');
      newRoot.className = 'Root';
      newRoot.innerHTML = state.html;
      Prism.highlightAllUnder(newRoot);
      state.domRoot = newRoot;
      if (state.url.indexOf('/search/') !== -1) {
        mySearch.focusSearch('article');
      }
    }
    oldRoot.parentNode.replaceChild(state.domRoot, oldRoot);
    html.className = html.className.replace(/Page_type_\w*/, 'Page_type_' + state.type);
    registerToC();
  };

  const applyMetrikaHit = () => {
    queue.pushTask(() => {
      if (window.galite) {
        galite('send', 'pageview')
      }
    })
  };

  const applyStateMeta = state => {
    document.title = state.title;
    html.setAttribute('lang', state.lang);
    HTMLElement.lang = state.lang;
    currentURL = state.url;
  };

  const applyUrlState = (url, hash, retry) => {
    const state = states[url];
    if (!state && !retry) {
      goToPage(url, hash, true);
      return;
    }
    applyStateDOM(state);
    applyStateMeta(state);
  };

  const getLang = url => {
    const matchedLang = url && url.match(/^\/(\w{2})\//);
    return matchedLang ? matchedLang[1] : 'en';
  }

  const hasVersions = lang => Object.keys(versions[lang]).length;

  const fetchVersions = lang => {
    if (!hasVersions(lang)) {
      versions[lang] = { isFetching: true };
      // TODO: use proper lang from args
      lazyQueue.pushTask(() => fetch(`/${lang === 'en' ? '' : (lang + '/')}versions.json`)
        .then(response => response.json())
        .then(responseObject => {
          versions[lang] = responseObject;
        }));
    }
  }

  const goToUrl = (url, hash, noPush) => {
    const state = states[url];

    const updateDOM = () => {
      if (hash) {
        shouldApplyPopState = false;
        applyStateDOM(state);
        location.hash = hash;
        if (!noPush) {
          window.history.replaceState({ url: url, hash: hash }, state.title, state.url + hash);
          applyMetrikaHit();
        }
        applyStateMeta(state);
        shouldApplyPopState = true;
      } else {
        if (!noPush) {
          window.history.pushState({ url: url }, state.title, state.url);
          applyMetrikaHit();
        }
        applyUrlState(url, false, noPush);
        window.scrollTo(0, 0);
      }
    }

    if (!document.startViewTransition) {
      updateDOM();
      return;
    }

    document.startViewTransition(() => {
      updateDOM();
    });    
  };

  const getFromLocalStorage = (url, callback) => {
    const lang = getLang(url);
    if (hasVersions(lang) && !versions[lang].isFetching) {
      const state = localStorage.getItem(url);
      const parsedState = state && JSON.parse(state);
      if (parsedState && versions[lang][url] === parsedState.version) {
        states[url] = parsedState;
        callback && callback();
        return parsedState;
      }
    }
  }

  let plannedURL;
  const goToPage = (url, hash, noPush) => {
    fetchVersions(getLang(url));
    if (states[url]) {
      if (states[url].isPreFetching) {
        plannedURL = url + hash;
        states[url].plannedNav = { url, hash };
      } else if (!states[url].isFetching) {
        goToUrl(url, hash, noPush);
      }
      return;
    }

    const localStorageVersion = getFromLocalStorage(url, () => goToUrl(url, hash, noPush));
    if (localStorageVersion) {
      return;
    }

    states[url] = { isFetching: true };
    fetch(url + 'index.json')
      .then(response => response.json())
      .then(state => {
        state.url = url;
        states[url] = state;
        goToUrl(url, hash, noPush);
      })
      .catch(() => {
        // In case of a fetch error, just go there manually.
        window.location.href = url + hash;
      });
  };

  const preloadPage = url => {
    const lang = getLang(url);
    if (url && !states[url] && hasVersions(lang)) {
      const localStorageVersion = getFromLocalStorage(url);
      if (localStorageVersion) {
        return;
      }

      states[url] = { isPreFetching: true };
      lazyQueue.pushTask(() => fetch(url + 'index.json')
        .then(response => response.json())
        .then(state => {
          const plannedNav = { ...states[url].plannedNav };
          state.url = url;
          if (versions[lang][url]) {
            state.version = versions[lang][url];
            localStorage.setItem(url, JSON.stringify(state));
          }
          states[url] = state;

          if (plannedURL === plannedNav.url + plannedNav.hash) {
            goToUrl(plannedNav.url, plannedNav.hash);
          }
        }));
    }
  };

  fetchVersions(getLang(currentURL));

  window.onpopstate = function (event) {
    if (shouldApplyPopState && (event.state || currentURL !== location.pathname)) {
      applyUrlState(event.state && event.state.url || getURL(), event.state && event.state.hash);
    }
  };

  const getLinkFromEvent = (e, filterModifier) => {
    e = e || window.event;
    const withModifier = e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
    const notPrimaryClick = e.which > 1 || e.button > 1;
    let link;
    if (!(filterModifier && withModifier) && !notPrimaryClick) {
      const path = e.path || (e.composedPath && e.composedPath());
      if (path) {
        for (let index = 0; index < path.length; index++) {
          if (path[index].tagName === 'A' && path[index].href) {
            link = path[index];
            break;
          }
        }
      } else {
        // Fallback for Edge, but without support for spans inside links for now
        link = e.target && e.target.href || e.srcElement && e.srcElement.href;
      }
    }
    if (link && link.href) {
      return link;
    }
  };

  const getURLToHandle = link => {
    if (link) {
      const parsedCurrentURL = new URL(window.location.href);
      const parsedNewURL = new URL(link.href);
      const isSameOrigin = parsedCurrentURL.origin === parsedNewURL.origin;
      const isSamePath = isSameOrigin && parsedCurrentURL.pathname === parsedNewURL.pathname;
      if (isSameOrigin && !isSamePath && !link.onclick) {
        return parsedNewURL;
      }
    }
    return {};
  }

  document.onclick = function (e) {
    const link = getLinkFromEvent(e, true);
    if (link) {
      const url = getURLToHandle(link);
      if (url.pathname) {
        goToPage(url.pathname, url.hash);
        return false;
      }
    }
  };

  document.addEventListener('mousemove', function (e) {
    preloadPage(getURLToHandle(getLinkFromEvent(e)).pathname);
  }, false);
};

export default initPjax;
