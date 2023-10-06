import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Analytics, settings, getAnalytics, logEvent } from 'firebase/analytics';

const CUSTOM_HOSTED_GTAG_URL = '/unknown-should-return-error';
const GTAG_URL = 'https://www.googletagmanager.com/gtag/js';
const FirebaseDataLayerName = 'dataLayerCustomMWA';
const FirebasegtagName = 'gtagCustomMWA';

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

const loadAnalyticsScript = async (firebaseConfig: FirebaseOptions) => {
  // Load gtag script hosted locally with updated protocol check with capacitor:// included to allow tracking from ios capacitor webviews
  // Has to be loaded before initFirebaseAnalytics call
  const response = await fetch(`${GTAG_URL}?l=${FirebaseDataLayerName}&id=${firebaseConfig.measurementId}`)

  let responseText = response.ok ? await response.text() : '';

  if (location.protocol === 'capacitor:') {
    responseText = responseText.replaceAll('"http:"', '"capacitor:"');
  }

  Function(responseText)();

  const script = document.createElement('script');
  script.src = `${CUSTOM_HOSTED_GTAG_URL}?l=${FirebaseDataLayerName}&id=${firebaseConfig.measurementId}&GTAG_URL=${GTAG_URL}`;
  script.async = true;
  document.head.appendChild(script);
};

// Call loadFirebaseAnalyticsScript() first
const initAnalytics = (firebaseApp: FirebaseApp) => {
  settings({
    dataLayerName: FirebaseDataLayerName,
    gtagName: FirebasegtagName,
  });
  analytics = getAnalytics(firebaseApp);
  return analytics;
};

const trackEvent = (eventName: string, eventParams: Record<string, unknown>) => {
  if (!analytics) {
    console.warn('%c @egym/mwa-analytics :: Analytics instance is not instantiated', 'background: #222; color: #bada55');
    return;
  }

  console.log('log event', analytics);
  logEvent(analytics, eventName, eventParams);
};

const init = async (firebaseConfig: FirebaseOptions, customFirebaseApp?: FirebaseApp) => {
  if (Object.values(firebaseConfig).some((value) => !value)) {
    console.warn('%c @egym/mwa-analytics :: Firebase config is not valid', 'background: #222; color: #bada55');
    return;
  }

  await loadAnalyticsScript(firebaseConfig);
  app = customFirebaseApp || initializeApp(firebaseConfig);
  initAnalytics(app);
};

export const firebase = {
  init,
  trackEvent
}
