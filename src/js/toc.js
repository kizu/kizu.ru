export const getToCMethods = () => {
  let lastHeader = '';
  const headersMap = new Map();
  const visibleElements = new Map();
  let previousHeader = '';

  const removeActiveHeaders = () => Array.from(document.getElementsByClassName('ToC-LI_active'))
    .forEach(item => item.classList.remove('ToC-LI_active'))

  const getCurrentHeader = () => {
    let scoredFirstHeader = false;
    const scoredHeaders = Array.from(visibleElements.keys())
    .sort((el1, el2) => {
      const nodes = Array.from(el1.parentNode.childNodes);
      return nodes.indexOf(el1) - nodes.indexOf(el2);
    })
    .reduce((scores, element, index) => {
      const headerId = headersMap.get(element);
      const isHeader = Boolean(element.tagName.match(/H\d/));
      const value = isHeader ? index === 0 ? 10 : !scoredFirstHeader ? 4 : 2 : 1;
      if (!scoredFirstHeader && isHeader) {
        scoredFirstHeader = true;
      }
      scores[headerId] = scores[headerId] ? scores[headerId] + value : value;
      return scores;
    }, {});
    const currentHeader = Object.keys(scoredHeaders)
      .sort((keyA, keyB) => scoredHeaders[keyB] - scoredHeaders[keyA])[0];
    return currentHeader;
  }

  const setCurrentHeaderInToC = () => {
    const header = getCurrentHeader();
    if (header !== previousHeader) {
      removeActiveHeaders();
      const linkElement = document.querySelector(`.ToC-Link[href='#${header}']`);
      if (linkElement) {
        const newHeader = linkElement.parentElement;
        newHeader.classList.add('ToC-LI_active');
      }
      previousHeader = header;
    }
  }

  const observer = new window.IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        visibleElements.set(target, true);
      } else {
        visibleElements.delete(target);
      }
      setCurrentHeaderInToC();
    });
  }, {
    root: null,
    threshold: 0,
  });

  const registerToC = () => {
    const elements = document.querySelectorAll('article > *:not(nav):not(aside):not(.Aside)');
    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      if (element.tagName.match(/H\d/)) {
        lastHeader = element.id;
      }
      headersMap.set(element, lastHeader);
    }
    elements.forEach(element => observer.observe(element));
  }

  const unregisterToC = () => {
    headersMap.clear();
    visibleElements.clear();
    lastHeader = '';
    previousHeader = '';
    observer.disconnect();
    removeActiveHeaders();
  }

  return { registerToC, unregisterToC };
};
