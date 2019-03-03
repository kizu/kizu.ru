import galite from 'ga-lite';

const initAnalytics = (id) => {
  if (navigator.doNotTrack !== 1 && window.doNotTrack !== 1) {
    galite('create', id, 'auto')
    galite('send', 'pageview')
    window.galite = galite;

    window.addEventListener(
      'unload',
      () => galite('send', 'timing', 'JS Dependencies', 'unload')
    );
  }
};

export default initAnalytics;
