if ('fetch' in window) {(() => {
  const states = {};
  const html = document.documentElement;

  const getURL = url => {
    const parsedCurrentURL = new URL(url || window.location.href);
    return parsedCurrentURL.origin + parsedCurrentURL.pathname;
  };

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

  const applyUrlStateDOM = url => {
    const state = states[url];
    if (!state) {
      return;
    }
    if (!state.domRoot) {
      const newRoot = document.createElement('div');
      newRoot.className = 'Root';
      newRoot.innerHTML = state.html;
      Prism.highlightAllUnder(newRoot);
      state.domRoot = newRoot;
      if (url.indexOf('/search/') !== -1) {
        mySearch.focusSearch('article');
      }
    }
    document.body.replaceChild(state.domRoot, document.body.getElementsByClassName('Root')[0]);
    html.className = html.className.replace(/Page_type_\w*/, 'Page_type_' + state.type);
  };

  const applyUrlStateMeta = url => {
    const state = states[url];
    if (!state) {
      return;
    }
    document.title = state.title;
    html.setAttribute('lang', state.lang);
    HTMLElement.lang = state.lang;
    currentURL = state.url;
  };

  const applyUrlState = url => {
    applyUrlStateDOM(url);
    applyUrlStateMeta(url);
  };

  const goToUrl = (url, hash) => {
    const state = states[url];

    if (hash) {
      shouldApplyPopState = false;
      applyUrlStateDOM(url);
      location.hash = hash;
      window.history.replaceState({ url: url }, state.title, state.url + hash);
      applyUrlStateMeta(url);
      shouldApplyPopState = true;
    } else {
      window.history.pushState({ url: url }, state.title, state.url);
      applyUrlState(url);
      window.scrollTo(0, 0);
    }
  };

  let plannedURL;
  const goToPage = (url, hash) => {
    if (states[url]) {
      if (states[url].isPreFetching) {
        plannedURL = url + hash;
        states[url].plannedNav = { url, hash };
      } else if (!states[url].isFetching) {
        goToUrl(url, hash);
      }
    } else {
      states[url] = { isFetching: true };
      fetch(url + 'index.json')
        .then(response => response.json())
        .then(state => {
          state.url = url;
          states[url] = state;
          goToUrl(url, hash);
        })
        .catch(() => {
          // In case of a fetch error, just go there manually.
          window.location.href = url + hash;
        });
    }
  };

  const preloadPage = url => {
    if (url && !states[url]) {
      states[url] = { isPreFetching: true };
      fetch(url + 'index.json')
        .then(response => response.json())
        .then(state => {
          const plannedNav = { ...states[url].plannedNav };
          state.url = url;
          states[url] = state;
          if (plannedURL === plannedNav.url + plannedNav.hash) {
            goToUrl(plannedNav.url, plannedNav.hash);
          }
        })
        .catch(() => {});
    }
  };

  window.onpopstate = function (event) {
    if (shouldApplyPopState && (event.state || (new URL(currentURL)).pathname !== location.pathname)) {
      applyUrlState(event.state && event.state.url || getURL());
    }
  };

  const getLinkFromEvent = (e, filterModifier) => {
    e = e || window.event;
    const withModifier = e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
    let link;
    if (!(filterModifier && withModifier)) {
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
    const parsedCurrentURL = new URL(window.location.href);
    const parsedNewURL = new URL(link.href);
    const isSameOrigin = parsedCurrentURL.origin === parsedNewURL.origin;
    const isSamePath = isSameOrigin && parsedCurrentURL.pathname === parsedNewURL.pathname;
    if (isSameOrigin && !isSamePath && !link.onclick) {
      return parsedNewURL;
    }
  }

  document.onclick = function (e) {
    const link = getLinkFromEvent(e, true);
    if (link) {
      const url = getURLToHandle(link);
      if (url) {
        goToPage(url.origin + url.pathname, url.hash);
        return false;
      }
    }
  };

  document.addEventListener('mousemove', function (e) {
    const link = getLinkFromEvent(e);
    if (link) {
      preloadPage(getURLToHandle(link))
    }
  }, false);
})()};
