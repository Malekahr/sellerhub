export function installSellerHubUiGuards() {
  installZoomGuards();
  installRouteDataset();
}

function installZoomGuards() {
  let lastTouchEnd = 0;

  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();

      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    },
    { passive: false }
  );

  document.addEventListener(
    "gesturestart",
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    "gesturechange",
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    },
    { passive: false }
  );
}

function installRouteDataset() {
  const updateRoute = () => {
    const path = window.location.pathname;

    let routeName =
      path
        .replace(/^\/+|\/+$/g, "")
        .replaceAll("/", "-")
        .replaceAll("_", "-") || "home";

    if (
      routeName === "create" ||
      routeName === "create-review" ||
      routeName === "reviews-create" ||
      routeName === "review-create"
    ) {
      routeName = "create-review";
    }

    if (routeName === "groups") {
      routeName = "groups";
    }

    document.body.dataset.appRoute = routeName;
  };

  updateRoute();

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function patchedPushState(...args) {
    const result = originalPushState.apply(this, args);
    updateRoute();
    return result;
  };

  history.replaceState = function patchedReplaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    updateRoute();
    return result;
  };

  window.addEventListener("popstate", updateRoute);
}