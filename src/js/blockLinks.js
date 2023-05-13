// @ts-check

const initBlockLinks = (selector = '.card', isCardsUpdate = false) => {
  let isSelecting = false;
  const startSelecting = (/** @type {KeyboardEvent} */ event) => {
    if (!event.altKey || isSelecting) {
      return;
    }
    isSelecting = true;
    // We're adding the class to the specific elements, as we don't want to cause a re-calculation of everything on the page. However, if we would have too many of the elements, we could think of just placing the class on the root.
    const cards = document.querySelectorAll(selector);
    for (const card of cards) {
      card.classList.add('is-selecting');
    }
  };

  const endSelecting = () => {
    if (!isSelecting) {
      return;
    }
    isSelecting = false;
    const cards = document.querySelectorAll(selector);
    for (const card of cards) {
      card.classList.remove('is-selecting');
    }
  };

  const endSelectingOnMousemove = (/** @type { MouseEvent } */ event) => {
    // Because we're checking this on every mouse move, we need to first check if the alt key is still pressed, so we won't remove the selection class prematurely.
    if (event.altKey) {
      return;
    }
    endSelecting();
  }

  document.addEventListener('keydown', startSelecting); 
  document.addEventListener('keyup', endSelecting); 
  // There are a lot of cases where the state could get stuck, the easiest way to handle those would be to listen to the mousemove.
  document.addEventListener('mousemove', endSelectingOnMousemove); 
};

export default initBlockLinks;
