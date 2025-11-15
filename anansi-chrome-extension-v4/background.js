/**
 * Anansi Watchdog V4 - Background Service Worker
 * Manages extension state and communications
 */

let stats = {
  messagesScanned: 0,
  threatsDetected: 0,
  scamsBlocked: 0,
  screenshotsAnalyzed: 0
};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    stats = request.stats;
    updateBadgeDisplay();
  }
  
  if (request.action === 'openPopup') {
    chrome.action.openPopup();
  }
  
  if (request.action === 'getStats') {
    sendResponse({ stats });
  }
  
  return true;
});

function updateBadgeDisplay() {
  const threatCount = stats.threatsDetected + stats.scamsBlocked;
  
  if (threatCount > 0) {
    chrome.action.setBadgeText({ text: threatCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  } else {
    chrome.action.setBadgeText({ text: stats.messagesScanned.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  }
}

// Initialize badge on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Anansi Watchdog V4 installed - Fraud detection enabled');
  chrome.action.setBadgeText({ text: '0' });
  chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    apiKey: '',
    threshold: 0.8,
    showWarnings: true,
    blockScams: true,
    autoScanScreenshots: false
  });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Reset stats for new page
    stats = {
      messagesScanned: 0,
      threatsDetected: 0,
      scamsBlocked: 0,
      screenshotsAnalyzed: 0
    };
    updateBadgeDisplay();
  }
});
