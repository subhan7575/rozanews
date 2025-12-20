
// This code registers a service worker to make the app work offline.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register() {
  if ('serviceWorker' in navigator) {
    // Unlike the build step version, we assume the sw.js is at the root
    // Using relative path to avoid origin mismatch issues in some preview environments
    const swUrl = './service-worker.js';

    window.addEventListener('load', () => {
      if (isLocalhost) {
        checkValidServiceWorker(swUrl);
        navigator.serviceWorker.ready.then(() => {
          console.log('App is being served cache-first by a service worker.');
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl);
      }
    });
  }
}

function registerValidSW(swUrl: string) {
  try {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content is available and will be used when all tabs for this page are closed.');
              } else {
                console.log('Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch((error) => {
        // Prevent crashing if origin doesn't match or other security errors occur
        if (error.message && error.message.includes('origin')) {
            console.warn('Service Worker registration skipped due to origin mismatch (likely in preview environment).');
        } else {
            console.error('Error during service worker registration:', error);
        }
      });
  } catch (e) {
    console.error("Service Worker registration failed synchronously:", e);
  }
}

function checkValidServiceWorker(swUrl: string) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
