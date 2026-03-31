/**
 * Scene Download Plugin for Stash
 * 
 * This plugin injects download icons into scene cards and detail pages, allowing users to download
 * scenes with custom filenames. The plugin uses GraphQL to fetch scene metadata and streams,
 * then downloads files as blobs to bypass server-side filename restrictions.
 * 
 * @fileoverview Adds download functionality to Stash scene interface
 * @author serechops
 * @version 1.0.0
 * 
 * Main Features:
 * - Adds download icons to scene cards in grid view
 * - Adds download links to scene detail pages  
 * - Fetches scene metadata via GraphQL
 * - Downloads files with custom naming format: {parent_folder}_{date}__{filename}
 * - Uses blob download method for reliable filename control
 * 
 * @requires PluginApi - Stash plugin API for event handling
 * @requires fetch - For GraphQL queries and file downloads
 * @requires MutationObserver - For DOM change detection
 */

/**
 * Extracts scene ID from DOM elements by searching for scene links
 * @param {HTMLElement} element - DOM element to search within
 * @returns {string|null} Scene ID if found, null otherwise
 */

/**
 * Sets up download buttons for scene cards in grid view
 * Waits for .scene-card elements and injects download icons
 * @returns {void}
 */

/**
 * Sets up download links for scene detail pages
 * Waits for stream links and adds download buttons
 * @returns {Promise<void>}
 */

/**
 * Fetches scene stream data from Stash GraphQL API
 * @param {string} sceneId - The scene ID to fetch data for
 * @returns {Promise<Object|null>} Object containing streamUrl, title, and date, or null if failed
 */

/**
 * Sanitizes a string for use as a filename by removing invalid characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized filename string
 */

/**
 * Downloads a file with custom filename using blob method
 * @param {string} url - URL of file to download
 * @param {string} filename - Desired filename for download
 * @returns {Promise<void>}
 */

/**
 * Observes DOM for new elements matching selector and calls callback
 * @param {string} selector - CSS selector to watch for
 * @param {Function} callback - Function to call when element found
 * @returns {void}
 */

/**
 * Creates a download button element with SVG icon
 * @param {string} [title="Download Scene"] - Tooltip text for button
 * @returns {HTMLAnchorElement} Configured download button element
 */

/**
 * Factory function that creates click event handler for download buttons
 * @param {HTMLElement} downloadLink - The download button element
 * @param {string} sceneId - Scene ID for the download
 * @returns {Promise<Function>} Async click event handler function
 */

/**
 * Fetches comprehensive scene data from GraphQL API
 * @param {string} sceneId - The scene ID to fetch data for
 * @returns {Promise<Object>} Enhanced scene data object with computed properties:
 *   - file_basename: Base filename
 *   - parent_basename: Parent folder name
 *   - streamUrl: Direct stream URL
 *   - item_date: Parsed and localized date
 *   - item_timestamp: Unix timestamp
 */
/********************************************************************
 * Scene Download Plugin
 *
 * Injects a download icon in the bottom-right corner of each scene card.
 * Clicking the icon will fetch the direct stream as a Blob, then prompt
 * the user to download it with a custom filename (title_date.mp4).
 ********************************************************************/

const PLUGIN_ID = "downloadman";
const PLUGIN_NAME = "Downloadman";
const PLUGIN_VERSION = "1.1-python";
const SCENE_CACHE_DB_NAME = "stashDownloadmanCache";
const SCENE_CACHE_DB_VERSION = 2;
const SCENE_CACHE_STORE_NAME = "sceneData";
const SCENE_CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const BYTE_ENCODER = new TextEncoder();
const SCENE_CACHE_STORAGE_KEYS = [
  `${PLUGIN_ID}:cache`,
  `${PLUGIN_ID}:scene-cache`,
  SCENE_CACHE_DB_NAME,
];

const pluginSettings = {
  enableLogging: true,
  cacheSizeMB: 10,
  maxConcurrentDownloads: 2,
};

const sceneCache = {
  db: null,
  entries: new Map(),
};

const downloadManager = {
  worker: null,
  workerState: "offline",
  lastWorkerError: null,
  jobsById: new Map(),
  jobsByScene: new Map(),
  historyEntries: new Map(),
  buttons: new Map(),
  nextJobId: 1,
  hasDetectedDownload: false,
  detectedDownloads: 0,
  completedDownloads: 0,
  failedDownloads: 0,
  ui: {
    activeTab: "workers",
    launcher: null,
    badge: null,
    panel: null,
    body: null,
    outsidePointerHandler: null,
  },
};

const DOWNLOAD_WORKER_SOURCE = `
let maxParallel = 2;
const queue = [];
let activeCount = 0;

self.onmessage = (event) => {
  const message = event.data || {};

  if (message.type === "configure") {
    const parsedValue = Number(message.maxParallel);
    if (Number.isFinite(parsedValue) && parsedValue >= 1) {
      maxParallel = Math.floor(parsedValue);
    }
    pump();
    return;
  }

  if (message.type === "download") {
    queue.push(message);
    self.postMessage({
      type: "queued",
      jobId: message.jobId,
      sceneId: message.sceneId,
    });
    pump();
  }
};

function pump() {
  while (activeCount < maxParallel && queue.length > 0) {
    const job = queue.shift();
    activeCount += 1;
    runJob(job).finally(() => {
      activeCount = Math.max(0, activeCount - 1);
      pump();
    });
  }
}

async function runJob(job) {
  self.postMessage({
    type: "started",
    jobId: job.jobId,
    sceneId: job.sceneId,
  });

  try {
    const response = await fetch(job.url, { credentials: "include" });
    if (!response.ok) {
      throw new Error("HTTP error! status: " + response.status);
    }

    const headerSize = Number(response.headers.get("Content-Length"));
    const totalBytes = Number.isFinite(headerSize) && headerSize > 0
      ? headerSize
      : (Number.isFinite(job.expectedSize) && job.expectedSize > 0 ? job.expectedSize : null);

    let blob;
    if (response.body && typeof response.body.getReader === "function") {
      const reader = response.body.getReader();
      const chunks = [];
      let receivedBytes = 0;

      while (true) {
        const result = await reader.read();
        if (result.done) {
          break;
        }

        if (result.value) {
          chunks.push(result.value);
          receivedBytes += result.value.byteLength;
          const percent = totalBytes ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : null;
          self.postMessage({
            type: "progress",
            jobId: job.jobId,
            sceneId: job.sceneId,
            receivedBytes,
            totalBytes,
            percent,
          });
        }
      }

      blob = new Blob(chunks);
    } else {
      blob = await response.blob();
      const size = blob.size;
      const total = totalBytes || size || null;
      const percent = total ? 100 : null;
      self.postMessage({
        type: "progress",
        jobId: job.jobId,
        sceneId: job.sceneId,
        receivedBytes: size,
        totalBytes: total,
        percent,
      });
    }

    self.postMessage({
      type: "complete",
      jobId: job.jobId,
      sceneId: job.sceneId,
      blob,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      jobId: job.jobId,
      sceneId: job.sceneId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
`;

function parseBooleanSetting(value, fallback = true) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === "true") {
      return true;
    }
    if (normalizedValue === "false") {
      return false;
    }
  }

  return fallback;
}

function parseNumberSetting(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeMaxConcurrentDownloads(value, fallback = 2) {
  const normalizedValue = Math.floor(parseNumberSetting(value, fallback));
  return Number.isFinite(normalizedValue) ? Math.max(1, normalizedValue) : fallback;
}

function normalizePluginsConfig(rawPlugins) {
  if (!rawPlugins) {
    return {};
  }

  if (typeof rawPlugins === "string") {
    try {
      return JSON.parse(rawPlugins);
    } catch (error) {
      debugError("settings:parse-error", error);
      return {};
    }
  }

  return rawPlugins;
}

async function loadPluginSettings() {
  try {
    const query = `
      query GetPluginConfiguration {
        configuration {
          plugins
        }
      }
    `;

    const response = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const pluginsConfig = normalizePluginsConfig(json?.data?.configuration?.plugins);
    const currentPluginConfig = pluginsConfig?.[PLUGIN_ID] || {};
    pluginSettings.enableLogging = parseBooleanSetting(currentPluginConfig.enableLogging, true);
    pluginSettings.cacheSizeMB = parseNumberSetting(currentPluginConfig.cacheSizeMB, 10);
    pluginSettings.maxConcurrentDownloads = normalizeMaxConcurrentDownloads(
      currentPluginConfig.maxConcurrentDownloads,
      2
    );
    debugLog("settings:loaded", {
      enableLogging: pluginSettings.enableLogging,
      cacheSizeMB: pluginSettings.cacheSizeMB,
      maxConcurrentDownloads: pluginSettings.maxConcurrentDownloads,
    });
  } catch (error) {
    pluginSettings.enableLogging = true;
    pluginSettings.cacheSizeMB = 10;
    pluginSettings.maxConcurrentDownloads = 2;
    debugError("settings:load-error", error);
  }
}

function debugLog(eventName, details) {
  if (!pluginSettings.enableLogging) {
    return;
  }

  if (typeof details === "undefined") {
    console.log(`[${PLUGIN_ID}] ${eventName}`);
    return;
  }

  console.log(`[${PLUGIN_ID}] ${eventName}`, details);
}

function debugError(eventName, details) {
  if (!pluginSettings.enableLogging) {
    return;
  }

  if (typeof details === "undefined") {
    console.error(`[${PLUGIN_ID}] ${eventName}`);
    return;
  }

  console.error(`[${PLUGIN_ID}] ${eventName}`, details);
}

function getSceneCacheLimitBytes() {
  return Math.max(0, pluginSettings.cacheSizeMB) * 1024 * 1024;
}

function isSceneCacheEnabled() {
  return getSceneCacheLimitBytes() > 0;
}

function buildSceneCacheEntryByteSize(entryBase) {
  let byteSize = 0;
  let nextByteSize = BYTE_ENCODER.encode(
    JSON.stringify({ ...entryBase, byteSize })
  ).length;

  while (nextByteSize !== byteSize) {
    byteSize = nextByteSize;
    nextByteSize = BYTE_ENCODER.encode(
      JSON.stringify({ ...entryBase, byteSize })
    ).length;
  }

  return byteSize;
}

function createSceneCacheEntry(sceneId, sceneData, options = {}) {
  const now = Date.now();
  const {
    fetchedAt = now,
    lastAccessedAt = now,
    uiState = {},
  } = options;
  const entryBase = {
    sceneId,
    sceneData,
    fetchedAt,
    lastAccessedAt,
    uiState,
  };

  return {
    ...entryBase,
    byteSize: buildSceneCacheEntryByteSize(entryBase),
  };
}

function isSceneCacheEntryExpired(entry) {
  return Date.now() - entry.fetchedAt > SCENE_CACHE_TTL_MS;
}

function isSceneCacheEntryValid(entry) {
  return Boolean(entry)
    && (typeof entry.sceneId === "string" || typeof entry.sceneId === "number")
    && Boolean(entry.sceneData)
    && typeof entry.sceneData === "object"
    && Number.isFinite(entry.byteSize)
    && entry.byteSize >= 0
    && Number.isFinite(entry.fetchedAt)
    && Number.isFinite(entry.lastAccessedAt)
    && Boolean(entry.uiState)
    && typeof entry.uiState === "object"
    && !Array.isArray(entry.uiState);
}

function clearSceneCacheLocalStorage() {
  for (const key of Object.keys(window.localStorage)) {
    if (SCENE_CACHE_STORAGE_KEYS.some((prefix) => key.startsWith(prefix))) {
      window.localStorage.removeItem(key);
    }
  }
}

function isSceneCacheDatabaseValid(database) {
  if (!database.objectStoreNames.contains(SCENE_CACHE_STORE_NAME)) {
    return false;
  }

  const transaction = database.transaction(SCENE_CACHE_STORE_NAME, "readonly");
  const store = transaction.objectStore(SCENE_CACHE_STORE_NAME);
  return store.keyPath === "sceneId";
}

function openSceneCacheDatabase() {
  return new Promise((resolve) => {
    const request = indexedDB.open(SCENE_CACHE_DB_NAME, SCENE_CACHE_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (database.objectStoreNames.contains(SCENE_CACHE_STORE_NAME)) {
        database.deleteObjectStore(SCENE_CACHE_STORE_NAME);
      }
      database.createObjectStore(SCENE_CACHE_STORE_NAME, { keyPath: "sceneId" });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteSceneCacheDatabase() {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(SCENE_CACHE_DB_NAME);
    request.onsuccess = () => resolve();
    request.onblocked = () => resolve();
  });
}

function requestResult(request) {
  return new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result);
  });
}

function transactionComplete(transaction) {
  return new Promise((resolve) => {
    transaction.oncomplete = () => resolve();
  });
}

function getSceneCacheStore(mode) {
  return sceneCache.db.transaction(SCENE_CACHE_STORE_NAME, mode).objectStore(SCENE_CACHE_STORE_NAME);
}

async function initializeSceneCache() {
  clearSceneCacheLocalStorage();
  sceneCache.entries.clear();
  sceneCache.db = await openSceneCacheDatabase();

  if (!isSceneCacheDatabaseValid(sceneCache.db)) {
    sceneCache.db.close();
    await deleteSceneCacheDatabase();
    clearSceneCacheLocalStorage();
    sceneCache.db = await openSceneCacheDatabase();
  }

  debugLog("cache:initialized", {
    version: SCENE_CACHE_DB_VERSION,
    cacheSizeMB: pluginSettings.cacheSizeMB,
  });
}

async function getPersistedSceneCacheEntry(sceneId) {
  return requestResult(getSceneCacheStore("readonly").get(sceneId));
}

async function getAllPersistedSceneCacheEntries() {
  return requestResult(getSceneCacheStore("readonly").getAll());
}

async function putPersistedSceneCacheEntry(entry) {
  const transaction = sceneCache.db.transaction(SCENE_CACHE_STORE_NAME, "readwrite");
  transaction.objectStore(SCENE_CACHE_STORE_NAME).put(entry);
  await transactionComplete(transaction);
}

async function deletePersistedSceneCacheEntry(sceneId) {
  const transaction = sceneCache.db.transaction(SCENE_CACHE_STORE_NAME, "readwrite");
  transaction.objectStore(SCENE_CACHE_STORE_NAME).delete(sceneId);
  await transactionComplete(transaction);
}

async function trimSceneCache() {
  if (!isSceneCacheEnabled()) {
    return;
  }

  const cacheLimitBytes = getSceneCacheLimitBytes();
  const persistedEntries = await getAllPersistedSceneCacheEntries();
  const entries = [];

  for (const entry of persistedEntries) {
    if (!isSceneCacheEntryValid(entry)) {
      sceneCache.entries.delete(entry?.sceneId);
      if (entry?.sceneId) {
        await deletePersistedSceneCacheEntry(entry.sceneId);
      }
      continue;
    }

    entries.push(entry);
  }

  let totalBytes = entries.reduce((sum, entry) => sum + entry.byteSize, 0);

  if (totalBytes <= cacheLimitBytes) {
    return;
  }

  const sortedEntries = entries
    .slice()
    .sort((left, right) => left.lastAccessedAt - right.lastAccessedAt);

  for (const entry of sortedEntries) {
    if (totalBytes <= cacheLimitBytes) {
      break;
    }

    totalBytes -= entry.byteSize;
    sceneCache.entries.delete(entry.sceneId);
    await deletePersistedSceneCacheEntry(entry.sceneId);
    debugLog("cache:evict", {
      sceneId: entry.sceneId,
      remainingBytes: totalBytes,
    });
  }
}

async function deleteSceneCacheEntry(sceneId) {
  sceneCache.entries.delete(sceneId);
  await deletePersistedSceneCacheEntry(sceneId);
}

async function touchSceneCacheEntry(entry) {
  const updatedEntry = createSceneCacheEntry(entry.sceneId, entry.sceneData, {
    fetchedAt: entry.fetchedAt,
    lastAccessedAt: Date.now(),
    uiState: entry.uiState,
  });
  sceneCache.entries.set(updatedEntry.sceneId, updatedEntry);
  await putPersistedSceneCacheEntry(updatedEntry);
  return updatedEntry;
}

async function readSceneCacheEntry(sceneId) {
  if (!isSceneCacheEnabled()) {
    return null;
  }

  const memoryEntry = sceneCache.entries.get(sceneId);
  if (memoryEntry) {
    if (!isSceneCacheEntryValid(memoryEntry)) {
      await deleteSceneCacheEntry(sceneId);
      return null;
    }

    if (isSceneCacheEntryExpired(memoryEntry)) {
      await deleteSceneCacheEntry(sceneId);
      return null;
    }

    return touchSceneCacheEntry(memoryEntry);
  }

  const persistedEntry = await getPersistedSceneCacheEntry(sceneId);
  if (!persistedEntry) {
    return null;
  }

  if (!isSceneCacheEntryValid(persistedEntry)) {
    await deleteSceneCacheEntry(sceneId);
    return null;
  }

  if (isSceneCacheEntryExpired(persistedEntry)) {
    await deleteSceneCacheEntry(sceneId);
    return null;
  }

  sceneCache.entries.set(sceneId, persistedEntry);
  return touchSceneCacheEntry(persistedEntry);
}

async function writeSceneCacheEntry(sceneId, sceneData, uiState = {}) {
  if (!isSceneCacheEnabled()) {
    return null;
  }

  const cachedEntry = sceneCache.entries.get(sceneId) || await getPersistedSceneCacheEntry(sceneId);
  const existingEntry = isSceneCacheEntryValid(cachedEntry) ? cachedEntry : null;
  if (cachedEntry && !existingEntry) {
    await deleteSceneCacheEntry(sceneId);
  }

  const entry = createSceneCacheEntry(sceneId, sceneData, {
    fetchedAt: Date.now(),
    lastAccessedAt: Date.now(),
    uiState: { ...(existingEntry?.uiState || {}), ...uiState },
  });

  sceneCache.entries.set(sceneId, entry);
  await putPersistedSceneCacheEntry(entry);
  await trimSceneCache();
  debugLog("cache:write", {
    sceneId,
    byteSize: entry.byteSize,
  });
  return entry;
}

async function markSceneDownloadComplete(sceneId, sceneData, downloadInfo = null) {
  const normalizedInfo = normalizeStoredDownloadInfo(downloadInfo, Date.now());
  const completedAt = normalizedInfo?.completedAt || Date.now();
  upsertDownloadHistoryEntry(
    createDownloadHistoryEntry(sceneId, sceneData, completedAt, normalizedInfo)
  );

  if (!isSceneCacheEnabled()) {
    return;
  }

  await writeSceneCacheEntry(sceneId, sceneData, {
    lastDownloadSucceededAt: completedAt,
    ...(normalizedInfo ? { downloadInfo: normalizedInfo } : {}),
  });
}

async function restoreDownloadButtonState(button, sceneId) {
  const cachedEntry = await readSceneCacheEntry(sceneId);
  if (downloadManager.jobsByScene.has(String(sceneId))) {
    return;
  }
  const downloadInfo = normalizeStoredDownloadInfo(
    cachedEntry?.uiState?.downloadInfo,
    cachedEntry?.uiState?.lastDownloadSucceededAt
  );
  setDownloadButtonMetadata(button, downloadInfo);
  if (downloadInfo) {
    markDownloadManagerDetected();
    button.dataset.interacted = "true";
    setDownloadButtonState(button, {
      mode: "success",
      title: "Downloaded",
      accentColor: "rgba(40, 167, 69, 0.92)",
    });
    debugLog("cache:restore-success", { sceneId });
  }
}

function getMaxConcurrentDownloads() {
  return normalizeMaxConcurrentDownloads(pluginSettings.maxConcurrentDownloads, 2);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

function getDownloadManagerJobStats() {
  const stats = {
    tracked: 0,
    preparing: 0,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
  };

  for (const job of downloadManager.jobsById.values()) {
    stats.tracked += 1;
    if (job.status === "preparing") {
      stats.preparing += 1;
      continue;
    }
    if (job.status === "queued") {
      stats.queued += 1;
      continue;
    }
    if (job.status === "running") {
      stats.running += 1;
      continue;
    }
    if (job.status === "completed") {
      stats.completed += 1;
      continue;
    }
    if (job.status === "failed") {
      stats.failed += 1;
    }
  }

  return stats;
}

function getDownloadManagerJobLabel(job) {
  if (job.status === "running" && typeof job.progressPercent === "number" && Number.isFinite(job.progressPercent)) {
    return `${job.status} ${job.progressPercent}%`;
  }

  if (job.status === "running" && job.receivedBytes > 0) {
    const sizeLabel = formatProgressLabel(job.receivedBytes);
    return sizeLabel ? `${job.status} ${sizeLabel}` : job.status;
  }

  return job.status;
}

function formatTimestamp(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "";
  }

  return new Date(timestamp).toLocaleString();
}

function normalizeStoredDownloadInfo(downloadInfo, fallbackCompletedAt = null) {
  const timestampValue = Number(downloadInfo?.completedAt ?? fallbackCompletedAt);
  if (!Number.isFinite(timestampValue) || timestampValue <= 0) {
    return null;
  }

  const sourceSizeBytes = Number(downloadInfo?.sourceSizeBytes);
  const downloadedBytes = Number(downloadInfo?.downloadedBytes);

  return {
    completedAt: timestampValue,
    requestedFilename: typeof downloadInfo?.requestedFilename === "string" ? downloadInfo.requestedFilename : "",
    sourceFilePath: typeof downloadInfo?.sourceFilePath === "string" ? downloadInfo.sourceFilePath : "",
    sourceSizeBytes: Number.isFinite(sourceSizeBytes) && sourceSizeBytes >= 0 ? sourceSizeBytes : null,
    downloadedBytes: Number.isFinite(downloadedBytes) && downloadedBytes >= 0 ? downloadedBytes : null,
  };
}

function createSceneDownloadInfo(sceneData, requestedFilename, completedAt, downloadedBytes) {
  return normalizeStoredDownloadInfo({
    completedAt,
    requestedFilename,
    sourceFilePath: sceneData?.files?.[0]?.path || "",
    sourceSizeBytes: sceneData?.files?.[0]?.size,
    downloadedBytes,
  });
}

function formatDownloadInfoSize(downloadInfo) {
  if (!downloadInfo) {
    return "";
  }

  const preferredBytes = Number.isFinite(downloadInfo.downloadedBytes) && downloadInfo.downloadedBytes > 0
    ? downloadInfo.downloadedBytes
    : downloadInfo.sourceSizeBytes;
  const preferredLabel = formatBytes(preferredBytes);
  if (!preferredLabel) {
    return "";
  }

  if (
    Number.isFinite(downloadInfo.downloadedBytes)
    && Number.isFinite(downloadInfo.sourceSizeBytes)
    && downloadInfo.downloadedBytes > 0
    && downloadInfo.sourceSizeBytes > 0
    && downloadInfo.downloadedBytes !== downloadInfo.sourceSizeBytes
  ) {
    return `${preferredLabel} downloaded (${formatBytes(downloadInfo.sourceSizeBytes)} source)`;
  }

  return preferredLabel;
}

function buildDownloadTooltipMarkup(downloadInfo) {
  if (!downloadInfo) {
    return "";
  }

  const rows = [];
  const completedAtLabel = formatTimestamp(downloadInfo.completedAt);
  if (completedAtLabel) {
    rows.push({ label: "Downloaded", value: completedAtLabel });
  }
  if (downloadInfo.requestedFilename) {
    rows.push({ label: "Saved as", value: downloadInfo.requestedFilename });
  }
  if (downloadInfo.sourceFilePath) {
    rows.push({ label: "Source", value: downloadInfo.sourceFilePath });
  }
  const sizeLabel = formatDownloadInfoSize(downloadInfo);
  if (sizeLabel) {
    rows.push({ label: "Size", value: sizeLabel });
  }
  if (rows.length === 0) {
    return "";
  }

  return `
    <div style="display:grid;gap:0.45rem;">
      <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.08em;color:#86efac;">Download details</div>
      ${rows.map((row) => `
        <div style="display:grid;gap:0.16rem;">
          <div style="font-size:0.64rem;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">${escapeHtml(row.label)}</div>
          <div style="color:#e2e8f0;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(row.value)}</div>
        </div>
      `).join("")}
      <div style="padding-top:0.15rem;border-top:1px solid rgba(148, 163, 184, 0.16);">
        <button
          type="button"
          data-download-tooltip-action="redownload"
          style="display:inline-flex;align-items:center;justify-content:center;min-height:2rem;padding:0.35rem 0.7rem;border-radius:9999px;border:1px solid rgba(134, 239, 172, 0.22);background:rgba(20, 83, 45, 0.34);color:#dcfce7;font-size:0.72rem;font-weight:700;letter-spacing:0.01em;cursor:pointer;"
        >Redownload</button>
      </div>
    </div>
  `;
}

const downloadMetadataTooltip = {
  element: null,
  activeButton: null,
  hideTimer: null,
};

function clearDownloadMetadataTooltipHideTimer() {
  if (downloadMetadataTooltip.hideTimer) {
    window.clearTimeout(downloadMetadataTooltip.hideTimer);
    downloadMetadataTooltip.hideTimer = null;
  }
}

function scheduleDownloadMetadataTooltipHide() {
  clearDownloadMetadataTooltipHideTimer();
  downloadMetadataTooltip.hideTimer = window.setTimeout(() => {
    hideDownloadMetadataTooltip();
  }, 120);
}

function ensureDownloadMetadataTooltip() {
  if (downloadMetadataTooltip.element?.isConnected) {
    return downloadMetadataTooltip.element;
  }

  const tooltip = document.createElement("div");
  tooltip.id = `${PLUGIN_ID}-download-tooltip`;
  tooltip.style.position = "fixed";
  tooltip.style.display = "none";
  tooltip.style.maxWidth = "min(24rem, calc(100vw - 1rem))";
  tooltip.style.padding = "0.75rem 0.85rem";
  tooltip.style.borderRadius = "0.85rem";
  tooltip.style.border = "1px solid rgba(134, 239, 172, 0.18)";
  tooltip.style.background = "rgba(2, 6, 23, 0.97)";
  tooltip.style.boxShadow = "0 18px 48px rgba(0, 0, 0, 0.4)";
  tooltip.style.backdropFilter = "blur(14px)";
  tooltip.style.color = "#e2e8f0";
  tooltip.style.fontSize = "0.76rem";
  tooltip.style.lineHeight = "1.45";
  tooltip.style.pointerEvents = "auto";
  tooltip.style.zIndex = "2147483647";
  tooltip.style.whiteSpace = "normal";
  tooltip.addEventListener("mouseenter", () => clearDownloadMetadataTooltipHideTimer());
  tooltip.addEventListener("mouseleave", () => scheduleDownloadMetadataTooltipHide());
  tooltip.addEventListener("click", (event) => {
    const actionButton = event.target instanceof Element
      ? event.target.closest("[data-download-tooltip-action]")
      : null;
    if (!actionButton) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (actionButton.getAttribute("data-download-tooltip-action") !== "redownload") {
      return;
    }

    const activeButton = downloadMetadataTooltip.activeButton;
    const sceneId = activeButton?.dataset?.sceneId;
    hideDownloadMetadataTooltip();
    if (!activeButton?.isConnected || !sceneId) {
      return;
    }

    handleSceneDownload(activeButton, sceneId).catch((error) => {
      debugError("download:redownload-error", {
        sceneId,
        error,
      });
    });
  });
  document.body.appendChild(tooltip);

  const dismissTooltip = () => hideDownloadMetadataTooltip();
  window.addEventListener("scroll", dismissTooltip, true);
  window.addEventListener("resize", dismissTooltip);

  downloadMetadataTooltip.element = tooltip;
  return tooltip;
}

function setDownloadButtonMetadata(button, downloadInfo = null) {
  const normalizedInfo = normalizeStoredDownloadInfo(downloadInfo);
  button._sceneDownloadInfo = normalizedInfo;
}

function positionDownloadMetadataTooltip(button, tooltip) {
  const rect = button.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const spacing = 10;
  const width = tooltip.offsetWidth;
  const height = tooltip.offsetHeight;
  const centeredLeft = rect.left + (rect.width / 2) - (width / 2);
  const left = Math.min(
    Math.max(8, centeredLeft),
    Math.max(8, viewportWidth - width - 8)
  );

  let top = rect.top - height - spacing;
  if (top < 8) {
    top = rect.bottom + spacing;
  }
  if (top + height > viewportHeight - 8) {
    top = Math.max(8, viewportHeight - height - 8);
  }

  tooltip.style.left = `${Math.round(left)}px`;
  tooltip.style.top = `${Math.round(top)}px`;
}

function showDownloadMetadataTooltip(button) {
  if (!button?.isConnected || button.dataset.downloadVisualState !== "success") {
    return;
  }

  const tooltipMarkup = buildDownloadTooltipMarkup(button._sceneDownloadInfo);
  if (!tooltipMarkup) {
    return;
  }

  const tooltip = ensureDownloadMetadataTooltip();
  clearDownloadMetadataTooltipHideTimer();
  tooltip.innerHTML = tooltipMarkup;
  tooltip.style.display = "block";
  tooltip.style.visibility = "hidden";
  positionDownloadMetadataTooltip(button, tooltip);
  tooltip.style.visibility = "visible";
  downloadMetadataTooltip.activeButton = button;
}

function hideDownloadMetadataTooltip() {
  clearDownloadMetadataTooltipHideTimer();
  const tooltip = downloadMetadataTooltip.element;
  if (tooltip) {
    tooltip.style.display = "none";
    tooltip.style.visibility = "hidden";
    tooltip.innerHTML = "";
  }
  downloadMetadataTooltip.activeButton = null;
}

function createDownloadHistoryEntry(sceneId, sceneData, completedAt, downloadInfo = null) {
  return {
    sceneId: String(sceneId),
    title: sceneData?.title || "",
    fileName: downloadInfo?.requestedFilename || sceneData?.file_basename || "",
    parentName: sceneData?.parent_basename || "",
    completedAt: Number(completedAt) || Date.now(),
  };
}

function upsertDownloadHistoryEntry(entry) {
  downloadManager.historyEntries.set(String(entry.sceneId), entry);
  renderDownloadManagerPanel();
}

async function refreshDownloadHistoryFromCache() {
  if (!isSceneCacheEnabled() || !sceneCache.db) {
    return;
  }

  const persistedEntries = await getAllPersistedSceneCacheEntries();
  for (const entry of persistedEntries) {
    if (!isSceneCacheEntryValid(entry)) {
      continue;
    }

    const downloadInfo = normalizeStoredDownloadInfo(
      entry?.uiState?.downloadInfo,
      entry?.uiState?.lastDownloadSucceededAt
    );
    if (!downloadInfo) {
      continue;
    }

    upsertDownloadHistoryEntry(
      createDownloadHistoryEntry(entry.sceneId, entry.sceneData, downloadInfo.completedAt, downloadInfo)
    );
  }
}

function renderDownloadManagerPanel() {
  const { launcher, badge, panel, body } = downloadManager.ui;
  if (!launcher || !badge || !panel || !body) {
    return;
  }

  launcher.style.display = downloadManager.hasDetectedDownload ? "inline-flex" : "none";
  panel.style.display = downloadManager.hasDetectedDownload && panel.dataset.open === "true" ? "block" : "none";

  const stats = getDownloadManagerJobStats();
  const activeCount = stats.preparing + stats.queued + stats.running;
  if (activeCount > 0) {
    badge.textContent = String(activeCount);
    badge.style.background = "#d97706";
  } else if (downloadManager.workerState === "online") {
    badge.textContent = "•";
    badge.style.background = "#16a34a";
  } else if (downloadManager.workerState === "error" || downloadManager.workerState === "unsupported") {
    badge.textContent = "!";
    badge.style.background = "#dc2626";
  } else {
    badge.textContent = "•";
    badge.style.background = "#1f2937";
  }
  badge.style.display = downloadManager.hasDetectedDownload ? "inline-flex" : "none";

  const activeJobs = Array.from(downloadManager.jobsById.values())
    .sort((left, right) => String(left.sceneId).localeCompare(String(right.sceneId)))
    .map((job) => `<div style="padding:0.35rem 0;border-top:1px solid rgba(148,163,184,0.12);">
      <div style="display:flex;justify-content:space-between;gap:0.75rem;">
        <span>Scene ${escapeHtml(job.sceneId)}</span>
        <span style="color:#cbd5e1;">${escapeHtml(getDownloadManagerJobLabel(job))}</span>
      </div>
    </div>`)
    .join("");

  const historyRows = Array.from(downloadManager.historyEntries.values())
    .sort((left, right) => right.completedAt - left.completedAt)
    .map((entry) => `<tr>
      <td style="padding:0.45rem 0.4rem;border-bottom:1px solid rgba(148,163,184,0.12);white-space:nowrap;">${escapeHtml(entry.sceneId)}</td>
      <td style="padding:0.45rem 0.4rem;border-bottom:1px solid rgba(148,163,184,0.12);">${escapeHtml(entry.title || entry.fileName || "-")}</td>
      <td style="padding:0.45rem 0.4rem;border-bottom:1px solid rgba(148,163,184,0.12);">${escapeHtml(entry.parentName || "-")}</td>
      <td style="padding:0.45rem 0.4rem;border-bottom:1px solid rgba(148,163,184,0.12);white-space:nowrap;">${escapeHtml(formatTimestamp(entry.completedAt) || "-")}</td>
    </tr>`)
    .join("");

  const workersContent = `
    <div style="display:grid;gap:0.55rem;">
      <div>
        <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Worker Status</div>
        <div style="margin-top:0.25rem;display:grid;gap:0.18rem;">
          <div>Status: ${escapeHtml(downloadManager.workerState)}</div>
          <div>Tracked jobs: ${stats.tracked}</div>
          <div>Preparing: ${stats.preparing}</div>
          <div>Queued: ${stats.queued}</div>
          <div>Running: ${stats.running}</div>
        </div>
      </div>
      <div>
        <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Plugin Info</div>
        <div style="margin-top:0.25rem;display:grid;gap:0.18rem;">
          <div>Name: ${escapeHtml(PLUGIN_NAME)}</div>
          <div>ID: ${escapeHtml(PLUGIN_ID)}</div>
          <div>Version: ${escapeHtml(PLUGIN_VERSION)}</div>
          <div>Max parallel: ${escapeHtml(getMaxConcurrentDownloads())}</div>
          <div>Logging: ${pluginSettings.enableLogging ? "enabled" : "disabled"}</div>
          <div>Cache: ${escapeHtml(pluginSettings.cacheSizeMB)} MB</div>
          <div>Downloads detected: ${downloadManager.detectedDownloads}</div>
          <div>Completed: ${downloadManager.completedDownloads}</div>
          <div>Failed: ${downloadManager.failedDownloads}</div>
        </div>
      </div>
      ${downloadManager.lastWorkerError ? `<div style="padding-top:0.2rem;color:#fca5a5;">Last worker error: ${escapeHtml(downloadManager.lastWorkerError)}</div>` : ""}
      <div>
        <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Jobs</div>
        <div style="margin-top:0.25rem;color:${activeJobs ? "#e2e8f0" : "#94a3b8"};">
          ${activeJobs || "No active jobs."}
        </div>
      </div>
    </div>
  `;

  const historyContent = `
    <div style="display:grid;gap:0.55rem;">
      <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">History</div>
      <div style="overflow:auto;border:1px solid rgba(148,163,184,0.12);border-radius:0.75rem;">
        <table style="width:100%;border-collapse:collapse;font-size:0.78rem;">
          <thead>
            <tr style="background:rgba(15,23,42,0.92);text-align:left;color:#cbd5e1;">
              <th style="padding:0.5rem 0.4rem;white-space:nowrap;">Scene</th>
              <th style="padding:0.5rem 0.4rem;white-space:nowrap;">Title / File</th>
              <th style="padding:0.5rem 0.4rem;white-space:nowrap;">Folder</th>
              <th style="padding:0.5rem 0.4rem;white-space:nowrap;">Downloaded</th>
            </tr>
          </thead>
          <tbody>
            ${historyRows || `<tr><td colspan="4" style="padding:0.85rem 0.4rem;color:#94a3b8;">No download history yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  body.innerHTML = `
    <div style="display:grid;gap:0.75rem;">
      <div style="display:flex;gap:0.45rem;">
        <button
          type="button"
          data-manager-tab="workers"
          style="border:1px solid ${downloadManager.ui.activeTab === "workers" ? "rgba(59,130,246,0.45)" : "rgba(148,163,184,0.2)"};background:${downloadManager.ui.activeTab === "workers" ? "rgba(30,64,175,0.28)" : "rgba(15,23,42,0.92)"};color:#e2e8f0;border-radius:9999px;padding:0.3rem 0.7rem;cursor:pointer;"
        >Workers</button>
        <button
          type="button"
          data-manager-tab="history"
          style="border:1px solid ${downloadManager.ui.activeTab === "history" ? "rgba(59,130,246,0.45)" : "rgba(148,163,184,0.2)"};background:${downloadManager.ui.activeTab === "history" ? "rgba(30,64,175,0.28)" : "rgba(15,23,42,0.92)"};color:#e2e8f0;border-radius:9999px;padding:0.3rem 0.7rem;cursor:pointer;"
        >History</button>
      </div>
      ${downloadManager.ui.activeTab === "history" ? historyContent : workersContent}
    </div>
  `;

  body.querySelectorAll("[data-manager-tab]").forEach((tabButton) => {
    tabButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      downloadManager.ui.activeTab = tabButton.getAttribute("data-manager-tab") || "workers";
      renderDownloadManagerPanel();
    });
  });
}

function closeDownloadManagerPanel() {
  const { launcher, panel } = downloadManager.ui;
  if (!launcher || !panel) {
    return;
  }

  launcher.dataset.panelOpen = "false";
  panel.dataset.open = "false";
  renderDownloadManagerPanel();
}

function toggleDownloadManagerPanel() {
  const { launcher, panel } = downloadManager.ui;
  if (!launcher || !panel) {
    return;
  }

  const isOpen = launcher.dataset.panelOpen === "true";
  launcher.dataset.panelOpen = isOpen ? "false" : "true";
  panel.dataset.open = launcher.dataset.panelOpen;
  renderDownloadManagerPanel();
}

function ensureDownloadManagerOutsidePointerHandler() {
  if (downloadManager.ui.outsidePointerHandler) {
    return;
  }

  const handler = (event) => {
    const { launcher, panel } = downloadManager.ui;
    if (!launcher || !panel || panel.dataset.open !== "true") {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (launcher.contains(target) || panel.contains(target)) {
      return;
    }

    closeDownloadManagerPanel();
  };

  downloadManager.ui.outsidePointerHandler = handler;
  document.addEventListener("pointerdown", handler, true);
}

function ensureDownloadManagerUI() {
  const existingLauncher = document.getElementById(`${PLUGIN_ID}-manager-launcher`);
  const existingPanel = document.getElementById(`${PLUGIN_ID}-manager-panel`);
  const existingBody = document.getElementById(`${PLUGIN_ID}-manager-body`);
  const existingBadge = document.getElementById(`${PLUGIN_ID}-manager-badge`);

  if (existingLauncher && existingPanel && existingBody && existingBadge) {
    downloadManager.ui.launcher = existingLauncher;
    downloadManager.ui.panel = existingPanel;
    downloadManager.ui.body = existingBody;
    downloadManager.ui.badge = existingBadge;
    ensureDownloadManagerOutsidePointerHandler();
    renderDownloadManagerPanel();
    return;
  }

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.id = `${PLUGIN_ID}-manager-launcher`;
  launcher.title = "Download Manager";
  launcher.style.position = "fixed";
  launcher.style.left = "1rem";
  launcher.style.bottom = "1rem";
  launcher.style.width = "3rem";
  launcher.style.height = "3rem";
  launcher.style.borderRadius = "9999px";
  launcher.style.border = "1px solid rgba(255, 255, 255, 0.12)";
  launcher.style.background = "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(2,6,23,0.98))";
  launcher.style.boxShadow = "0 16px 48px rgba(0, 0, 0, 0.4)";
  launcher.style.color = "#f8fafc";
  launcher.style.cursor = "pointer";
  launcher.style.display = "none";
  launcher.style.alignItems = "center";
  launcher.style.justifyContent = "center";
  launcher.style.zIndex = "2147483647";
  launcher.style.padding = "0";
  launcher.style.overflow = "hidden";
  launcher.innerHTML = `
    <span style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;">${DOWNLOAD_ICON_SVG}</span>
  `;
  launcher.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleDownloadManagerPanel();
  });

  const badge = document.createElement("span");
  badge.id = `${PLUGIN_ID}-manager-badge`;
  badge.style.position = "absolute";
  badge.style.top = "0.2rem";
  badge.style.right = "0.2rem";
  badge.style.minWidth = "1.1rem";
  badge.style.height = "1.1rem";
  badge.style.padding = "0 0.25rem";
  badge.style.borderRadius = "9999px";
  badge.style.display = "none";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.fontSize = "0.62rem";
  badge.style.fontWeight = "700";
  badge.style.lineHeight = "1";
  badge.style.color = "#f8fafc";
  badge.textContent = "0";
  launcher.appendChild(badge);

  const panel = document.createElement("section");
  panel.id = `${PLUGIN_ID}-manager-panel`;
  panel.dataset.open = "false";
  panel.style.position = "fixed";
  panel.style.left = "1rem";
  panel.style.bottom = "4.5rem";
  panel.style.width = "min(22rem, calc(100vw - 2rem))";
  panel.style.maxHeight = "min(28rem, calc(100vh - 6rem))";
  panel.style.overflow = "auto";
  panel.style.padding = "0.9rem 1rem";
  panel.style.borderRadius = "1rem";
  panel.style.border = "1px solid rgba(148, 163, 184, 0.18)";
  panel.style.background = "rgba(2, 6, 23, 0.96)";
  panel.style.backdropFilter = "blur(16px)";
  panel.style.boxShadow = "0 24px 64px rgba(0, 0, 0, 0.42)";
  panel.style.color = "#e2e8f0";
  panel.style.fontSize = "0.82rem";
  panel.style.lineHeight = "1.45";
  panel.style.zIndex = "2147483647";
  panel.style.display = "none";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.gap = "0.75rem";
  header.style.marginBottom = "0.75rem";
  header.innerHTML = `
    <div>
      <div style="font-size:0.95rem;font-weight:700;color:#f8fafc;">Download Manager</div>
      <div style="font-size:0.72rem;color:#94a3b8;">Worker status and plugin info</div>
    </div>
  `;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Close";
  closeButton.style.border = "1px solid rgba(148, 163, 184, 0.2)";
  closeButton.style.background = "rgba(15, 23, 42, 0.9)";
  closeButton.style.color = "#e2e8f0";
  closeButton.style.borderRadius = "9999px";
  closeButton.style.padding = "0.28rem 0.65rem";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeDownloadManagerPanel();
  });
  header.appendChild(closeButton);

  const body = document.createElement("div");
  body.id = `${PLUGIN_ID}-manager-body`;

  panel.appendChild(header);
  panel.appendChild(body);
  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  downloadManager.ui.launcher = launcher;
  downloadManager.ui.badge = badge;
  downloadManager.ui.panel = panel;
  downloadManager.ui.body = body;
  ensureDownloadManagerOutsidePointerHandler();
  renderDownloadManagerPanel();
}

function markDownloadManagerDetected() {
  if (!downloadManager.hasDetectedDownload) {
    downloadManager.hasDetectedDownload = true;
  }
  ensureDownloadManagerUI();
  renderDownloadManagerPanel();
}

function createDownloadWorker() {
  const workerBlob = new Blob([DOWNLOAD_WORKER_SOURCE], { type: "text/javascript" });
  const workerUrl = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerUrl);
  window.setTimeout(() => URL.revokeObjectURL(workerUrl), 0);
  worker.addEventListener("message", handleDownloadWorkerMessage);
  worker.addEventListener("error", handleDownloadWorkerError);
  downloadManager.workerState = "online";
  downloadManager.lastWorkerError = null;
  worker.postMessage({
    type: "configure",
    maxParallel: getMaxConcurrentDownloads(),
  });
  renderDownloadManagerPanel();
  return worker;
}

function ensureDownloadWorker() {
  if (downloadManager.worker) {
    return downloadManager.worker;
  }

  if (typeof Worker !== "function") {
    downloadManager.workerState = "unsupported";
    downloadManager.lastWorkerError = "Web Workers are unavailable in this browser.";
    debugError("worker:unsupported");
    renderDownloadManagerPanel();
    return null;
  }

  downloadManager.worker = createDownloadWorker();
  return downloadManager.worker;
}

function configureDownloadWorker() {
  const worker = ensureDownloadWorker();
  if (!worker) {
    return;
  }

  downloadManager.workerState = "online";
  worker.postMessage({
    type: "configure",
    maxParallel: getMaxConcurrentDownloads(),
  });
  renderDownloadManagerPanel();
}

function handleDownloadWorkerError(error) {
  downloadManager.workerState = "error";
  downloadManager.lastWorkerError = error?.message || "Unknown worker error";
  debugError("worker:error", error);
  renderDownloadManagerPanel();
}

function getSceneDownloadJob(sceneId) {
  return downloadManager.jobsByScene.get(String(sceneId)) || null;
}

function getLiveDownloadButtons(sceneId) {
  const taskSceneId = String(sceneId);
  const buttons = downloadManager.buttons.get(taskSceneId);
  if (!buttons) {
    return [];
  }

  const liveButtons = [];
  for (const button of buttons) {
    if (button?.isConnected) {
      liveButtons.push(button);
      continue;
    }

    buttons.delete(button);
  }

  if (buttons.size === 0) {
    downloadManager.buttons.delete(taskSceneId);
  }

  return liveButtons;
}

function applyDownloadJobState(button, job) {
  if (!button?.isConnected) {
    return;
  }

  if (job.status === "preparing") {
    setDownloadButtonLabel(button, "...", {
      title: "Preparing download",
    });
    return;
  }

  if (job.status === "queued") {
    setDownloadButtonState(button, {
      mode: "status",
      label: "Q",
      title: "Queued",
    });
    return;
  }

  if (job.status === "running") {
    if (typeof job.progressPercent === "number" && Number.isFinite(job.progressPercent)) {
      setDownloadButtonLabel(button, String(job.progressPercent), {
        progress: job.progressPercent,
        title: `${job.progressPercent}% downloaded`,
      });
      return;
    }

    const sizeLabel = formatProgressLabel(job.receivedBytes);
    setDownloadButtonState(button, {
      mode: "status",
      label: sizeLabel || "...",
      title: job.totalBytes
        ? `${sizeLabel} / ${formatBytes(job.totalBytes)}`
        : "Downloading",
    });
    return;
  }

  if (job.status === "completed") {
    setDownloadButtonMetadata(button, job.downloadInfo);
    setDownloadButtonState(button, {
      mode: "success",
      title: "Download complete",
      accentColor: "rgba(40, 167, 69, 0.92)",
    });
    return;
  }

  setDownloadButtonState(button, {
    mode: "error",
    label: "ERR",
    title: job.errorMessage || "Download failed",
    accentColor: "rgba(220, 53, 69, 0.92)",
  });
}

function notifyDownloadJob(job) {
  for (const button of getLiveDownloadButtons(job.sceneId)) {
    applyDownloadJobState(button, job);
  }
  renderDownloadManagerPanel();
}

function registerDownloadButton(sceneId, button) {
  const taskSceneId = String(sceneId);
  button.dataset.sceneId = taskSceneId;
  if (!button.dataset.downloadHref || button.dataset.downloadHref === "#") {
    setDownloadButtonHref(button, buildSceneStreamHref(taskSceneId));
  }

  let buttons = downloadManager.buttons.get(taskSceneId);
  if (!buttons) {
    buttons = new Set();
    downloadManager.buttons.set(taskSceneId, buttons);
  }
  buttons.add(button);

  const job = getSceneDownloadJob(taskSceneId);
  if (job) {
    applyDownloadJobState(button, job);
    return;
  }

  restoreDownloadButtonState(button, taskSceneId).catch((error) => {
    debugError("download:restore-button-state-error", {
      sceneId: taskSceneId,
      error,
    });
  });
}

function createPendingDownloadJob(sceneId) {
  return {
    jobId: `job-${downloadManager.nextJobId++}`,
    sceneId,
    status: "preparing",
    sceneData: null,
    fileName: null,
    expectedSize: null,
    receivedBytes: 0,
    totalBytes: null,
    progressPercent: null,
    errorMessage: null,
    downloadInfo: null,
  };
}

function storeDownloadJob(job) {
  downloadManager.jobsById.set(job.jobId, job);
  downloadManager.jobsByScene.set(job.sceneId, job);
  renderDownloadManagerPanel();
}

function releaseDownloadJob(job) {
  downloadManager.jobsById.delete(job.jobId);
  const activeSceneJob = getSceneDownloadJob(job.sceneId);
  if (activeSceneJob && activeSceneJob.jobId === job.jobId) {
    downloadManager.jobsByScene.delete(job.sceneId);
  }
  renderDownloadManagerPanel();
}

function scheduleDownloadJobCleanup(job) {
  const delayMs = job.status === "failed" ? 1600 : 100;
  window.setTimeout(() => {
    const activeSceneJob = getSceneDownloadJob(job.sceneId);
    if (!activeSceneJob || activeSceneJob.jobId !== job.jobId || activeSceneJob.status !== job.status) {
      return;
    }

    releaseDownloadJob(job);

    if (job.status === "failed") {
      for (const button of getLiveDownloadButtons(job.sceneId)) {
        resetDownloadButton(button);
      }
    }
  }, delayMs);
}

function handleDownloadWorkerMessage(event) {
  const message = event.data || {};
  const job = downloadManager.jobsById.get(message.jobId);
  if (!job) {
    return;
  }

  if (message.type === "queued") {
    job.status = "queued";
    notifyDownloadJob(job);
    return;
  }

  if (message.type === "started") {
    job.status = "running";
    notifyDownloadJob(job);
    return;
  }

  if (message.type === "progress") {
    job.status = "running";
    job.receivedBytes = Number(message.receivedBytes) || 0;
    job.totalBytes = Number(message.totalBytes) || job.totalBytes;
    job.progressPercent = Number.isFinite(message.percent) ? message.percent : null;
    notifyDownloadJob(job);
    return;
  }

  if (message.type === "complete") {
    saveBlobAsDownload(message.blob, job.fileName);
    const completedAt = Date.now();
    const downloadedBytes = Number(message.blob?.size);
    job.receivedBytes = Number.isFinite(downloadedBytes) ? downloadedBytes : job.receivedBytes;
    job.totalBytes = Number.isFinite(downloadedBytes) && downloadedBytes > 0
      ? downloadedBytes
      : job.totalBytes;
    job.status = "completed";
    job.progressPercent = 100;
    job.downloadInfo = createSceneDownloadInfo(
      job.sceneData,
      job.fileName,
      completedAt,
      downloadedBytes
    );
    downloadManager.completedDownloads += 1;
    notifyDownloadJob(job);
    markSceneDownloadComplete(job.sceneId, job.sceneData, job.downloadInfo).catch((error) => {
      debugError("download:mark-complete-error", {
        sceneId: job.sceneId,
        error,
      });
    });
    scheduleDownloadJobCleanup(job);
    return;
  }

  if (message.type === "error") {
    job.status = "failed";
    job.errorMessage = message.error || "Download failed";
    downloadManager.failedDownloads += 1;
    notifyDownloadJob(job);
    debugLog("download:error", {
      sceneId: job.sceneId,
      message: job.errorMessage,
    });
    scheduleDownloadJobCleanup(job);
  }
}

async function initializePlugin() {
  await loadPluginSettings();
  await initializeSceneCache();
  await refreshDownloadHistoryFromCache();
  ensureDownloadManagerUI();
  configureDownloadWorker();
  debugLog("plugin:loaded", {
    enableLogging: pluginSettings.enableLogging,
    cacheSizeMB: pluginSettings.cacheSizeMB,
    maxConcurrentDownloads: pluginSettings.maxConcurrentDownloads,
  });

  // Listen for page changes (e.g. navigating between Scenes/Performers pages)
  PluginApi.Event.addEventListener("stash:location", (e) => {
    debugLog("event:stash-location", {
      pathname: e.detail?.data?.location?.pathname,
    });
    setupSceneGridDownloadButtons();
    setupSceneDetailDownloadLinks();
  });

  // Run once on initial load as well
  debugLog("plugin:initial-setup");
  setupSceneGridDownloadButtons();
  setupSceneDetailDownloadLinks();
}

initializePlugin().catch((error) => {
  debugError("plugin:init-error", error);
});

function GetElementSceneId(element) {
  for (const link of element.querySelectorAll('a[href^="/scene"]')) {
    const sceneId = link.getAttribute("href").match(/\/scene[s]?\/(\d+)/) [1] || -1;
    if (sceneId) {
      return sceneId
    }
  }
  return null
}

function buildSceneStreamHref(sceneId) {
  return `/scene/${encodeURIComponent(String(sceneId))}/stream`;
}

function setDownloadButtonHref(button, href) {
  if (!(button instanceof HTMLAnchorElement)) {
    return;
  }

  const resolvedHref = typeof href === "string" && href.trim()
    ? href.trim()
    : "#";

  button.href = resolvedHref;
  button.dataset.downloadHref = resolvedHref;
}

function shouldConsumeDownloadEvent(event) {
  if (!event) {
    return false;
  }

  if (event.type === "contextmenu") {
    return false;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  if ("button" in event && typeof event.button === "number" && event.button !== 0) {
    return false;
  }

  return true;
}

function consumeEvent(event) {
  if (!shouldConsumeDownloadEvent(event)) {
    return false;
  }

  debugLog("event:consume", {
    type: event.type,
    targetClass: event.currentTarget?.className || event.target?.className || null,
  });
  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === "function") {
    event.stopImmediatePropagation();
  }

  return true;
}

function trapNavigationEvents(element) {
  ["pointerdown", "mousedown", "mouseup", "touchstart", "touchend", "dblclick"].forEach((eventName) => {
    debugLog("listener:trap-navigation", {
      eventName,
      title: element.title || null,
    });
    element.addEventListener(eventName, (event) => {
      consumeEvent(event);
    }, true);
  });
}

const DOWNLOAD_ICON_SVG = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    aria-hidden="true"
    width="15"
    height="15"
  >
    <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3
              0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3
              s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0
              c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56
              a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
  </svg>
`;

const CHECKMARK_ICON_SVG = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    aria-hidden="true"
    width="15"
    height="15"
  >
    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zM363.3 180.7c10-10 10-26.2 0-36.2s-26.2-10-36.2 0L224 247.5l-39.2-39.2c-10-10-26.2-10-36.2 0s-10 26.2 0 36.2l57.3 57.3c10 10 26.2 10 36.2 0l121.2-121.2z"/>
  </svg>
`;

const DOWNLOAD_BUTTON_IDLE_OPACITY = "0.25";
const DOWNLOAD_BUTTON_INTERACTED_OPACITY = "0.9";
const DOWNLOAD_BUTTON_HOVER_OPACITY = "1";
const DOWNLOAD_BUTTON_SUCCESS_OPACITY = "1";

function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) {
    return "";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatProgressLabel(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) {
    return "...";
  }

  if (value < 1024) {
    return `${Math.max(1, Math.round(value))}B`;
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)}K`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${Math.round(value / (1024 * 1024))}M`;
  }

  return `${Math.round(value / (1024 * 1024 * 1024))}G`;
}

function ensureDownloadButtonParts(button) {
  let ring = button.querySelector(".scene-download-ring");
  let face = button.querySelector(".scene-download-face");
  let content = button.querySelector(".scene-download-content");

  if (ring && face && content) {
    return { ring, face, content };
  }

  button.replaceChildren();

  ring = document.createElement("span");
  ring.classList.add("scene-download-ring");
  ring.style.position = "absolute";
  ring.style.inset = "0";
  ring.style.borderRadius = "9999px";
  ring.style.pointerEvents = "none";
  ring.style.transition = "background 180ms ease, transform 180ms ease, opacity 180ms ease";

  face = document.createElement("span");
  face.classList.add("scene-download-face");
  face.style.position = "absolute";
  face.style.inset = "3px";
  face.style.borderRadius = "9999px";
  face.style.display = "flex";
  face.style.alignItems = "center";
  face.style.justifyContent = "center";
  face.style.pointerEvents = "none";
  face.style.transition = "background 180ms ease, box-shadow 180ms ease";

  content = document.createElement("span");
  content.classList.add("scene-download-content");
  content.style.display = "inline-flex";
  content.style.alignItems = "center";
  content.style.justifyContent = "center";
  content.style.lineHeight = "1";
  content.style.fontWeight = "700";
  content.style.color = "#fff";
  content.style.transition = "transform 180ms ease, opacity 180ms ease, color 180ms ease";

  face.appendChild(content);
  button.appendChild(ring);
  button.appendChild(face);

  return { ring, face, content };
}

function stopDownloadButtonAnimation(button) {
  if (button._sceneDownloadAnimation) {
    button._sceneDownloadAnimation.cancel();
    button._sceneDownloadAnimation = null;
  }
}

function startDownloadButtonAnimation(button, target) {
  stopDownloadButtonAnimation(button);
  button._sceneDownloadAnimation = target.animate(
    [
      { transform: "rotate(0deg)" },
      { transform: "rotate(360deg)" },
    ],
    {
      duration: 1100,
      easing: "linear",
      iterations: Infinity,
    }
  );
}

function getDownloadButtonBaseOpacity(button) {
  if (button.dataset.downloadVisualState === "success") {
    return DOWNLOAD_BUTTON_SUCCESS_OPACITY;
  }

  if (button.dataset.interacted === "true") {
    return DOWNLOAD_BUTTON_INTERACTED_OPACITY;
  }

  return DOWNLOAD_BUTTON_IDLE_OPACITY;
}

function syncDownloadButtonOpacity(button, hovered = false) {
  button.style.opacity = hovered ? DOWNLOAD_BUTTON_HOVER_OPACITY : getDownloadButtonBaseOpacity(button);
}

function markDownloadButtonInteracted(button) {
  button.dataset.interacted = "true";
  syncDownloadButtonOpacity(button);
}

function attachDownloadButtonOpacityHandlers(host, button) {
  host.addEventListener("mouseover", () => syncDownloadButtonOpacity(button, true));
  host.addEventListener("mouseout", () => syncDownloadButtonOpacity(button, false));
}

function attachDownloadButtonTooltipHandlers(button) {
  button.addEventListener("mouseenter", () => showDownloadMetadataTooltip(button));
  button.addEventListener("mouseleave", () => {
    if (downloadMetadataTooltip.activeButton === button) {
      scheduleDownloadMetadataTooltipHide();
    }
  });
  button.addEventListener("focus", () => showDownloadMetadataTooltip(button));
  button.addEventListener("blur", () => {
    if (downloadMetadataTooltip.activeButton === button) {
      scheduleDownloadMetadataTooltipHide();
    }
  });
}

function setDownloadButtonState(button, options = {}) {
  const {
    mode = "idle",
    title = button.dataset.defaultTitle || "Download Scene",
    label = "",
    progress = null,
    accentColor = "rgba(64, 196, 255, 0.96)",
  } = options;
  const { ring, face, content } = ensureDownloadButtonParts(button);
  const boundedProgress = typeof progress === "number" && Number.isFinite(progress)
    ? Math.max(0, Math.min(100, progress))
    : null;

  stopDownloadButtonAnimation(button);
  if (downloadMetadataTooltip.activeButton === button && mode !== "success") {
    hideDownloadMetadataTooltip();
  }
  button.dataset.downloadVisualState = mode;
  button.title = mode === "success" && button._sceneDownloadInfo ? "" : title;
  button.setAttribute("aria-label", title);
  button.style.width = "2rem";
  button.style.minWidth = "2rem";
  button.style.height = "2rem";
  button.style.padding = "0";
  button.style.borderRadius = "9999px";
  button.style.overflow = "hidden";
  button.style.position = button.style.position || "relative";
  button.style.border = "none";
  button.style.background = "transparent";
  button.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.35)";
  button.style.transform = "translateZ(0)";

  ring.style.opacity = "1";
  face.style.background = "rgba(8, 10, 14, 0.88)";
  face.style.boxShadow = "inset 0 0 0 1px rgba(255, 255, 255, 0.08)";
  content.style.fontSize = "0.82rem";
  content.style.letterSpacing = "0";
  content.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.45)";

  if (mode === "idle") {
    button.disabled = false;
    button.dataset.downloading = "false";
    ring.style.background = "rgba(255, 255, 255, 0.16)";
    content.innerHTML = DOWNLOAD_ICON_SVG;
    const svg = content.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", "14");
      svg.setAttribute("height", "14");
      svg.style.display = "block";
    }
    syncDownloadButtonOpacity(button);
    return;
  }

  button.disabled = true;
  markDownloadButtonInteracted(button);

  if (mode === "loading") {
    button.dataset.downloading = "true";
    ring.style.background = "conic-gradient(rgba(255, 255, 255, 0.95) 0 25%, rgba(255, 255, 255, 0.14) 25% 100%)";
    content.innerHTML = DOWNLOAD_ICON_SVG;
    const svg = content.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.style.display = "block";
    }
    startDownloadButtonAnimation(button, ring);
    syncDownloadButtonOpacity(button);
    return;
  }

  if (mode === "progress") {
    button.dataset.downloading = "true";
    ring.style.background = `conic-gradient(${accentColor} 0 ${boundedProgress}%, rgba(255, 255, 255, 0.14) ${boundedProgress}% 100%)`;
    content.textContent = label;
    content.style.fontSize = label.length >= 4 ? "0.48rem" : (label.length >= 3 ? "0.56rem" : "0.66rem");
    content.style.letterSpacing = "-0.03em";
    syncDownloadButtonOpacity(button);
    return;
  }

  if (mode === "status") {
    button.dataset.downloading = "true";
    ring.style.background = "conic-gradient(rgba(64, 196, 255, 0.92) 0 78%, rgba(255, 255, 255, 0.14) 78% 100%)";
    content.textContent = label;
    content.style.fontSize = label.length >= 4 ? "0.44rem" : "0.54rem";
    content.style.letterSpacing = "-0.03em";
    syncDownloadButtonOpacity(button);
    return;
  }

  if (mode === "success") {
    button.disabled = false;
    button.dataset.downloading = "false";
    button.dataset.interacted = "true";
    ring.style.background = accentColor;
    face.style.background = "rgba(14, 56, 28, 0.88)";
    content.innerHTML = CHECKMARK_ICON_SVG;
    const svg = content.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", "14");
      svg.setAttribute("height", "14");
      svg.style.display = "block";
    }
    syncDownloadButtonOpacity(button);
    return;
  }

  button.dataset.downloading = "true";
  ring.style.background = accentColor;
  face.style.background = "rgba(84, 18, 18, 0.88)";
  content.textContent = label;
  content.style.fontSize = "0.56rem";
  content.style.letterSpacing = "0.02em";
  syncDownloadButtonOpacity(button);
}

function resetDownloadButton(button) {
  setDownloadButtonState(button, {
    mode: "idle",
    title: button.dataset.defaultTitle || "Download Scene",
  });
}

function setDownloadButtonLabel(button, label, options = {}) {
  const { progress = null, title = label } = options;
  if (typeof progress === "number" && Number.isFinite(progress)) {
    setDownloadButtonState(button, {
      mode: "progress",
      label,
      progress,
      title,
      accentColor: "rgba(40, 167, 69, 0.96)",
    });
    return;
  }

  setDownloadButtonState(button, {
    mode: "loading",
    title,
  });
}

function pulseDownloadButton(button, label, background, title) {
  const successLike = /40,\s*167,\s*69|0f|28a745/i.test(background);
  setDownloadButtonState(button, {
    mode: successLike ? "success" : "error",
    label,
    title,
    accentColor: background,
  });
  if (!successLike) {
    window.setTimeout(() => resetDownloadButton(button), 1600);
  }
}

function buildDownloadFileName(sceneData) {
  const sceneFile = sceneData.file_basename;
  const downloadDate = (new Date()).toISOString().split("T")[0];
  return `${sceneData.parent_basename}_${downloadDate}__${sceneFile}`;
}

async function handleSceneDownload(button, sceneId) {
  const sceneKey = String(sceneId);
  markDownloadButtonInteracted(button);
  const existingJob = getSceneDownloadJob(sceneKey);
  if (existingJob && ["preparing", "queued", "running"].includes(existingJob.status)) {
    notifyDownloadJob(existingJob);
    return;
  }

  if (existingJob) {
    releaseDownloadJob(existingJob);
  }

  downloadManager.detectedDownloads += 1;
  markDownloadManagerDetected();
  const job = createPendingDownloadJob(sceneKey);
  storeDownloadJob(job);
  notifyDownloadJob(job);

  try {
    const sceneData = await FetchSceneData(sceneKey);
    if (!sceneData?.streamUrl) {
      throw new Error(`Could not find stream URL for scene ${sceneKey}`);
    }

    for (const liveButton of getLiveDownloadButtons(sceneKey)) {
      setDownloadButtonHref(liveButton, sceneData.streamUrl);
    }

    const worker = ensureDownloadWorker();
    if (!worker) {
      throw new Error("Download worker unavailable");
    }

    job.sceneData = sceneData;
    job.fileName = buildDownloadFileName(sceneData);
    job.expectedSize = Number(sceneData?.files?.[0]?.size);
    job.totalBytes = Number.isFinite(job.expectedSize) && job.expectedSize > 0 ? job.expectedSize : null;

    debugLog("download:start", {
      sceneId: sceneKey,
      streamUrl: sceneData.streamUrl,
      fileName: job.fileName,
    });

    worker.postMessage({
      type: "download",
      jobId: job.jobId,
      sceneId: sceneKey,
      url: sceneData.streamUrl,
      expectedSize: job.expectedSize,
    });
  } catch (error) {
    job.status = "failed";
    job.errorMessage = error instanceof Error ? error.message : String(error);
    notifyDownloadJob(job);
    debugLog("download:error", {
      sceneId: sceneKey,
      message: job.errorMessage,
    });
    scheduleDownloadJobCleanup(job);
  }
}

/**
 * Main function: Waits for `.scene-card` elements and injects a download icon into each.
 */
function setupSceneGridDownloadButtons() {
  debugLog("setup:grid:start");

  // is triggered for each instance
  waitForElement(".scene-card,.wall-item", (sceneCard) => {
    // If this card already has a download icon, skip
    if (sceneCard.querySelector(".scene-download-overlay,.scene-download-icon")) {
      return;
    }

    const sceneId = GetElementSceneId(sceneCard);
    if (!sceneId) { return null; }
    debugLog("setup:grid:inject", { sceneId });

    // Create the download link/icon
    if (window.getComputedStyle(sceneCard).position === "static") {
      sceneCard.style.position = "relative";
    }
    sceneCard.style.isolation = "isolate";

    const overlay = document.createElement("div");
    overlay.classList.add("scene-download-overlay");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "2147483646";

    const downloadLink = CreateDownloadButton("Download Scene", buildSceneStreamHref(sceneId))
    downloadLink.style.position = "absolute";
    downloadLink.style.top = "0.5rem";
    downloadLink.style.right = "0.5rem";
    downloadLink.style.transitionDuration = "300ms";
    overlay.appendChild(downloadLink);
    sceneCard.appendChild(overlay);
    attachDownloadButtonOpacityHandlers(sceneCard, downloadLink);
    syncDownloadButtonOpacity(downloadLink);
    trapNavigationEvents(downloadLink);
    registerDownloadButton(sceneId, downloadLink);
    
    downloadLink.addEventListener("click", 
      /**
       * ClickHandler
       * @param {Event | MouseEvent} event 
       */
      async function ClickHandler(event) {
        if (!consumeEvent(event)) {
          return;
        }
        debugLog("event:grid-click", { sceneId });
        await handleSceneDownload(downloadLink, sceneId);
      }
    );
  });
    // downloadLink.removeEventListener("click", sceneDownloader);
    // On click: fetch the scene metadata (including paths, title, date) and then trigger download
    // downloadLink.addEventListener("click", async (event) => {
    //   event.preventDefault();
    //   event.stopPropagation();

    //   console.log("Download icon clicked for scene ID:", sceneId);

    //   const sceneData = await fetchSceneStreamData(sceneId);
    //   if (!sceneData || !sceneData.streamUrl) {
    //     console.error("Could not retrieve stream URL for scene", sceneId);
    //     return;
    //   }

    //   console.log(
    //     `Stream URL for scene "${sceneData.title}" (${sceneData.date}) =>`,
    //     sceneData.streamUrl
    //   );

    //   // Construct a filename from the scene's title/date
    //   const safeTitle = sanitizeFilename(sceneData.title || `scene-${sceneId}`);
    //   const safeDate = sanitizeFilename(sceneData.date || "");
    //   // Example format: Title_YYYY-MM-DD.mp4
    //   // Adjust format to your preference:
    //   const fileName = safeDate
    //     ? `${safeTitle}_${safeDate}.mp4`
    //     : `${safeTitle}.mp4`;

    //   // Use the fetch-as-Blob approach to reliably name the file
    //   await triggerDownloadAsBlob(sceneData.streamUrl, fileName);
    // });
}

async function setupSceneDetailDownloadLinks() {
  waitForElement('a[href*="/scene/"][href*="/stream"]', async (streamLink) => {
    const streamRow = streamLink.parentElement;

    // If this row already has a download icon, skip
    if (!streamRow || streamRow.querySelector(".scene-download-icon")) {
      return;
    }
    debugLog("setup:detail:found-stream-link", {
      href: streamLink.getAttribute("href"),
    });

    const sceneMatch = streamLink.getAttribute("href").match(/\/scene\/(\d+)\/stream(?:$|[?#])/);
    if (!sceneMatch) {
      return;
    }

    const sceneId = sceneMatch[1];

    debugLog("setup:detail:inject", { sceneId });
    const downloadLink = CreateDownloadButton("Download Scene", streamLink.getAttribute("href") || buildSceneStreamHref(sceneId));
    downloadLink.style.transitionDuration = "300ms";
    downloadLink.style.flexShrink = "0";
    trapNavigationEvents(downloadLink);
    registerDownloadButton(sceneId, downloadLink);
    attachDownloadButtonOpacityHandlers(downloadLink, downloadLink);
    syncDownloadButtonOpacity(downloadLink);
    downloadLink.addEventListener("click",
      /**
       * 
       * @param {Event | MouseEvent} event 
       */
      async function (event) {
        if (!consumeEvent(event)) {
          return;
        }
        debugLog("event:detail-click", { sceneId });
        await handleSceneDownload(downloadLink, sceneId);
      }
    );

    const detailWrapper = document.createElement("div");
    detailWrapper.classList.add("scene-download-detail");
    detailWrapper.style.display = "flex";
    detailWrapper.style.flexDirection = "column";
    detailWrapper.style.alignItems = "stretch";
    detailWrapper.style.gap = "0.35rem";
    detailWrapper.style.width = "100%";
    detailWrapper.style.minWidth = "0";

    streamLink.style.minWidth = "0";
    streamLink.style.overflowWrap = "anywhere";
    streamLink.style.wordBreak = "break-word";

    const actionRow = document.createElement("div");
    actionRow.classList.add("scene-download-detail-actions");
    actionRow.style.display = "flex";
    actionRow.style.justifyContent = "flex-start";
    actionRow.style.width = "100%";

    streamLink.replaceWith(detailWrapper);
    detailWrapper.appendChild(streamLink);
    actionRow.appendChild(downloadLink);
    detailWrapper.appendChild(actionRow);
  })
}

/**
 * Queries Stash’s GraphQL for the direct stream path, title, and date.
 * We'll return an object with { streamUrl, title, date }.
 */
async function fetchSceneStreamData(sceneId) {
  // Include "title" and "date" in addition to "paths { stream }"
  const query = `
    query GetSceneStream($id: ID!) {
      findScene(id: $id) {
        id
        title
        date
        paths {
          stream
        }
        files {
          basename
          size
          path
          parent_folder {
            path
          }
        }
        tags {
          id
          name
        }
        sceneStreams {
          url
          mime_type
          label
        }
      }
    }
  `;

  try {
    const response = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // If Stash requires auth cookies
      body: JSON.stringify({
        query,
        variables: { id: sceneId },
      }),
    });

    if (!response.ok) {
      debugError("graphql:fetch-scene-stream:status", { sceneId, status: response.status });
      return null;
    }

    const json = await response.json();
    const scene = json?.data?.findScene;
    if (!scene) {
      debugError("graphql:fetch-scene-stream:no-scene", { sceneId, response: json });
      return null;
    }

    // Extract the direct stream. Handle both array or object `paths`.
    let streamUrl = null;
    const paths = scene.paths;

    if (Array.isArray(paths) && paths.length > 0 && paths[0].stream) {
      streamUrl = paths[0].stream;
    } else if (!Array.isArray(paths) && paths.stream) {
      streamUrl = paths.stream;
    }

    return {
      streamUrl: streamUrl,
      title: scene.title || "",
      date: scene.date || "",
    };
  } catch (err) {
    debugError("graphql:fetch-scene-stream:error", { sceneId, error: err });
  }

  return null;
}

/**
 * Helper to sanitize a string for use as a filename (remove invalid characters, trim, etc.)
 */
function sanitizeFilename(str) {
  // Remove characters not allowed in Windows filenames: <>:"/\|?*
  return str
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "_");
}

/**
 * Downloads a file with a custom filename by:
 * 1. Fetching the file as a Blob
 * 2. Creating an object URL
 * 3. Triggering <a download="filename" href="blob:...">
 *
 * This approach bypasses any server "Content-Disposition" overrides.
 */
function saveBlobAsDownload(blob, filename) {
  const objectURL = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectURL), 60 * 1000);
}

async function triggerDownloadAsBlob(url, filename, options = {}) {
  debugLog("download:fetch", { url, filename });
  const { expectedSize, onProgress } = options;
  try {
    // If Stash is behind auth, you might need credentials: "include" here as well
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    debugLog("download:response", {
      url,
      status: response.status,
      contentLength: response.headers.get("Content-Length"),
      expectedSize,
    });

    const headerSize = Number(response.headers.get("Content-Length"));
    const totalBytes = Number.isFinite(headerSize) && headerSize > 0
      ? headerSize
      : (Number.isFinite(expectedSize) && expectedSize > 0 ? expectedSize : null);

    let blob;
    if (response.body && typeof response.body.getReader === "function") {
      const reader = response.body.getReader();
      const chunks = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        if (value) {
          chunks.push(value);
          receivedBytes += value.byteLength;

          if (typeof onProgress === "function") {
            const percent = totalBytes ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : null;
            onProgress({ receivedBytes, totalBytes, percent });
          }
        }
      }

      blob = new Blob(chunks);
    } else {
      blob = await response.blob();
      if (typeof onProgress === "function") {
        const size = blob.size;
        const total = totalBytes || size || null;
        const percent = total ? 100 : null;
        onProgress({ receivedBytes: size, totalBytes: total, percent });
      }
    }

    saveBlobAsDownload(blob, filename);
  } catch (err) {
    debugError("download:blob-error", { filename, url, error: err });
    throw err;
  }
}

/**
 * Observe the DOM for new `.scene-card` elements and call `callback` for each.
 */
function waitForElement(selector, callback) {
  // Immediately call callback on any existing matches
  document.querySelectorAll(selector).forEach((el) => callback(el));

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches(selector)) {
          callback(node);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          node.querySelectorAll(selector).forEach((matched) => {
            callback(matched);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function CreateDownloadButton(title = "Download Scene", href = "#") {
  const downloadLink = document.createElement("a");
  downloadLink.classList.add("scene-download-icon");
  downloadLink.style.display = "inline-flex";
  downloadLink.style.alignItems = "center";
  downloadLink.style.justifyContent = "center";
  downloadLink.style.width = "1.75rem";
  downloadLink.style.height = "1.75rem";
  downloadLink.style.borderRadius = "9999px";
  downloadLink.style.border = "none";
  downloadLink.style.appearance = "none";
  downloadLink.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
  downloadLink.style.pointerEvents = "auto";
  downloadLink.style.cursor = "pointer";
  downloadLink.style.color = "#fff"; // The icon color will match this
  downloadLink.style.textDecoration = "none";
  downloadLink.style.zIndex = "2147483647";
  downloadLink.dataset.defaultTitle = title;
  downloadLink.dataset.downloading = "false";
  downloadLink.dataset.interacted = "false";
  downloadLink.dataset.downloadVisualState = "idle";
  downloadLink.setAttribute("draggable", "false");
  setDownloadButtonHref(downloadLink, href);
  setDownloadButtonMetadata(downloadLink, null);
  attachDownloadButtonTooltipHandlers(downloadLink);
  resetDownloadButton(downloadLink);
  return downloadLink;
}

function normalizeSceneData(sceneId, rawSceneData) {
  const normalizedSceneData = {
    ...rawSceneData,
  };
  const streamUrl = normalizedSceneData.paths && Array.isArray(normalizedSceneData.paths) && normalizedSceneData.paths.length > 0 && normalizedSceneData.paths[0].stream
    ? normalizedSceneData.paths[0].stream
    : (!Array.isArray(normalizedSceneData.paths) && normalizedSceneData.paths.stream ? normalizedSceneData.paths.stream : undefined);

  function basename(path) {
    return path.split("/").reverse()[0];
  }

  normalizedSceneData.file_basename = normalizedSceneData.files[0].basename;
  normalizedSceneData.parent_basename = basename(normalizedSceneData.files[0].parent_folder.path);
  normalizedSceneData.streamUrl = streamUrl;
  normalizedSceneData.item_date = (typeof normalizedSceneData.date === "string") ? new Date(normalizedSceneData.date) : new Date();
  normalizedSceneData.item_date = new Date(
    normalizedSceneData.item_date.getTime() - (normalizedSceneData.item_date.getTimezoneOffset() * 60000)
  );
  normalizedSceneData.item_timestamp = normalizedSceneData.item_date.getTime();

  debugLog("graphql:fetch-scene:item-date", {
    sceneId,
    itemDate: normalizedSceneData.item_date,
  });

  return normalizedSceneData;
}

async function FetchSceneData(sceneId) {
  const cachedEntry = await readSceneCacheEntry(sceneId);
  if (cachedEntry) {
    debugLog("cache:hit", { sceneId });
    return cachedEntry.sceneData;
  }

  debugLog("cache:miss", { sceneId });
  debugLog("graphql:fetch-scene", { sceneId });
  const query = `
      query GetSceneDownload($id: ID!) {
        findScene(id: $id) {
          files {
            basename
            size
            path
            parent_folder {
              path
            }
          }
          title
          id
          date
          sceneStreams {
            url
            mime_type
            label
          }
          paths {
            stream
          }
          tags {
            id
          }
        }
      }
  `;

  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // If Stash requires auth cookies
    body: JSON.stringify({
      query,
      variables: { id: sceneId },
    }),
  });

  if (!response.ok) {
    debugError("graphql:fetch-scene:status", { sceneId, status: response.status });
    throw new Error("GraphQL fetch failed");
  }

  const json = await response.json();
  const sceneData = json?.data?.findScene;
  if (!sceneData) {
    debugError("graphql:fetch-scene:no-scene", {
      sceneId,
      query,
      response: json,
    });
    return null;
  }

  debugLog("graphql:fetch-scene:success", { sceneId, sceneData });
  const normalizedSceneData = normalizeSceneData(sceneId, sceneData);
  await writeSceneCacheEntry(sceneId, normalizedSceneData);
  return normalizedSceneData;
}
