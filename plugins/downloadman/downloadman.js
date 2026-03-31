const CARD_SELECTOR = ".scene-card,.wall-item";
const STREAM_SELECTOR = 'a[href*="/scene/"][href*="/stream"]';
const BUTTON_CLASS = "downloadman-button";
const TOOLS_ROUTE = "/settings/tools/downloadman";
const SCENE_PAGE_PATH_RE = /^\/scenes\/\d+(?:\/|$)/;

const DOWNLOAD_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="14" height="14" aria-hidden="true">
    <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32v242.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64v-32c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48a24 24 0 1 1 0-48z"/>
  </svg>
`;

const DONE_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="13" height="13" aria-hidden="true">
    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7L393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
  </svg>
`;

const SCENE_QUERY = `
  query DownloadmanScene($id: ID!) {
    findScene(id: $id) {
      id
      files {
        basename
      }
      paths {
        stream
      }
    }
  }
`;

let scanQueued = false;
const React = PluginApi.React;
const downloadmanState = {
  settings: null,
};

const DownloadmanToolsPage = () =>
  React.createElement("div", {
    className: "downloadman-tools-page",
    style: {
      minHeight: "100%",
    },
  });

PluginApi.register.route(TOOLS_ROUTE, DownloadmanToolsPage);

async function loadSettings() {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        query DownloadmanPluginConfiguration {
          configuration {
            plugins
          }
        }
      `,
    }),
  });

  const payload = await response.json();
  const settings = payload.data.configuration.plugins.downloadman;

  downloadmanState.settings = {
    displayGridLinks: settings.displayGridLinks,
    displaySceneDetailLinks: settings.displaySceneDetailLinks,
  };
}

function getSceneIdFromSceneHref(href) {
  return href.match(/^\/scenes\/(\d+)(?:\/|$|\?|#)/)[1];
}

function getSceneIdFromStreamHref(href) {
  return href.match(/^\/scene\/(\d+)\/stream(?:\/|$|\?|#)/)[1];
}

function getSceneIdFromCard(card) {
  const link = card.querySelector('a[href^="/scenes/"]');
  return getSceneIdFromSceneHref(link.getAttribute("href"));
}

function isSceneDetailPage() {
  return SCENE_PAGE_PATH_RE.test(window.location.pathname);
}

function hasNestedCard(card) {
  return !!card.querySelector(CARD_SELECTOR);
}

function setButtonState(button, state) {
  button.dataset.state = state;

  if (state === "busy") {
    button.style.background = "rgba(217, 119, 6, 0.96)";
    button.innerHTML = DOWNLOAD_ICON;
    button.title = "Downloading";
    return;
  }

  if (state === "done") {
    button.style.background = "rgba(22, 163, 74, 0.96)";
    button.innerHTML = DONE_ICON;
    button.title = "Downloaded";
    return;
  }

  button.style.background = "rgba(0, 0, 0, 0.78)";
  button.innerHTML = DOWNLOAD_ICON;
  button.title = "Download Scene";
}

function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function createDownloadButton(sceneId, href) {
  const button = document.createElement("a");
  button.className = BUTTON_CLASS;
  button.dataset.sceneId = sceneId;
  button.dataset.state = "idle";
  button.href = href;
  button.draggable = false;
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.width = "1.9rem";
  button.style.height = "1.9rem";
  button.style.borderRadius = "9999px";
  button.style.textDecoration = "none";
  button.style.color = "#fff";
  button.style.cursor = "pointer";
  button.style.pointerEvents = "auto";
  button.style.boxShadow = "0 10px 24px rgba(0, 0, 0, 0.35)";
  button.style.backdropFilter = "blur(10px)";
  button.style.zIndex = "2147483647";
  button.style.transition = "transform 120ms ease, background 120ms ease, opacity 120ms ease";
  button.style.opacity = "0.28";
  setButtonState(button, "idle");

  button.addEventListener("mouseenter", () => {
    button.style.opacity = "1";
  });

  button.addEventListener("mouseleave", () => {
    button.style.opacity = button.dataset.state === "done" ? "1" : "0.28";
  });

  for (const eventName of ["pointerdown", "mousedown", "mouseup", "touchstart", "touchend", "dblclick"]) {
    button.addEventListener(eventName, stopEvent, true);
  }

  button.addEventListener(
    "click",
    async (event) => {
      stopEvent(event);

      if (button.dataset.state === "busy") {
        return;
      }

      await downloadScene(button);
    },
    true
  );

  return button;
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function fetchScene(sceneId) {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: SCENE_QUERY,
      variables: { id: sceneId },
    }),
  });
  const payload = await response.json();
  const scene = payload.data.findScene;
  return {
    sceneId: scene.id,
    filename: scene.files[0].basename,
    streamUrl: scene.paths.stream,
  };
}

async function downloadScene(button) {
  setButtonState(button, "busy");

  const scene = await fetchScene(button.dataset.sceneId);
  button.href = scene.streamUrl;

  const response = await fetch(scene.streamUrl, { credentials: "include" });
  const blob = await response.blob();
  saveBlob(blob, scene.filename);

  setButtonState(button, "done");
  button.style.opacity = "1";

  window.setTimeout(() => {
    if (button.isConnected && button.dataset.state === "done") {
      setButtonState(button, "idle");
      button.style.opacity = "0.28";
    }
  }, 1600);
}

function mountCardButton(card) {
  if (!downloadmanState.settings.displayGridLinks) {
    return;
  }

  if (hasNestedCard(card)) {
    return;
  }

  if (card.querySelector(`.${BUTTON_CLASS}`)) {
    return;
  }

  const sceneId = getSceneIdFromCard(card);

  if (window.getComputedStyle(card).position === "static") {
    card.style.position = "relative";
  }
  card.style.isolation = "isolate";

  const overlay = document.createElement("div");
  overlay.className = "downloadman-overlay";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "2147483646";

  const button = createDownloadButton(sceneId, `/scene/${sceneId}/stream`);
  button.style.position = "absolute";
  button.style.top = "0.5rem";
  button.style.right = "0.5rem";

  overlay.append(button);
  card.append(overlay);
}

function mountDetailButton(streamLink) {
  if (!downloadmanState.settings.displaySceneDetailLinks) {
    return;
  }

  if (!isSceneDetailPage()) {
    return;
  }

  if (
    streamLink.classList.contains(BUTTON_CLASS)
    || streamLink.closest(".downloadman-overlay,.downloadman-detail")
  ) {
    return;
  }

  const href = streamLink.getAttribute("href") || "";
  const sceneId = getSceneIdFromStreamHref(href);

  const wrapper = document.createElement("div");
  wrapper.className = "downloadman-detail";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "stretch";
  wrapper.style.gap = "0.35rem";
  wrapper.style.width = "100%";
  wrapper.style.minWidth = "0";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "flex-start";

  const button = createDownloadButton(sceneId, href);
  button.style.flexShrink = "0";

  streamLink.style.minWidth = "0";
  streamLink.style.overflowWrap = "anywhere";
  streamLink.style.wordBreak = "break-word";

  streamLink.replaceWith(wrapper);
  wrapper.append(streamLink);
  actions.append(button);
  wrapper.append(actions);
}

function isToolsPage() {
  return window.location.pathname.startsWith("/settings/tools");
}

function stripIds(root) {
  if (root instanceof Element && root.hasAttribute("id")) {
    root.removeAttribute("id");
  }

  if (!(root instanceof Element)) {
    return;
  }

  for (const element of root.querySelectorAll("[id]")) {
    element.removeAttribute("id");
  }
}

function replaceText(root, fromText, toText) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue && node.nodeValue.includes(fromText)) {
      node.nodeValue = node.nodeValue.replace(fromText, toText);
    }
  }
}

function mountToolsLink() {
  if (!isToolsPage()) {
    return;
  }

  if (document.querySelector("[data-downloadman-tools-link='true']")) {
    return;
  }

  const source = [...document.querySelectorAll("a,button,[role='button']")].find((element) =>
    /GraphQL playground/i.test(element.textContent || "")
  );

  const link = source.cloneNode(true);
  stripIds(link);
  replaceText(link, "GraphQL playground", "Downloadman");
  replaceText(link, "GraphQL Playground", "Downloadman");
  link.dataset.downloadmanToolsLink = "true";

  if (link instanceof HTMLAnchorElement) {
    link.href = TOOLS_ROUTE;
  }

  link.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.history.pushState({}, "", TOOLS_ROUTE);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  source.parentElement.insertBefore(link, source.nextSibling);
}

function scan() {
  document.querySelectorAll(CARD_SELECTOR).forEach(mountCardButton);
  if (isSceneDetailPage()) {
    document.querySelectorAll(STREAM_SELECTOR).forEach(mountDetailButton);
  }
  mountToolsLink();
}

function queueScan() {
  if (scanQueued) {
    return;
  }

  scanQueued = true;
  window.requestAnimationFrame(() => {
    scanQueued = false;
    scan();
  });
}

async function start() {
  await loadSettings();
  queueScan();
  new MutationObserver(queueScan).observe(document.body, {
    childList: true,
    subtree: true,
  });
  PluginApi.Event.addEventListener("stash:location", queueScan);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
