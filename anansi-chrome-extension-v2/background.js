// Anansi Watchdog - Background Service Worker
// Manages extension lifecycle, stats persistence, and message routing

console.log('🕷️ Anansi Watchdog background service worker initialized');

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🕷️ First time installation - setting up defaults');
    
    const defaultSettings = {
      enabled: true,
      showWarnings: true,
      enabledPlatforms: {
        chatgpt: true,
        gemini: true,
        claude: true
      }
    };
    
    const defaultStats = {
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0,
      lastUpdated: new Date().toISOString()
    };
    
    chrome.storage.sync.set({ settings: defaultSettings });
    chrome.storage.local.set({ stats: defaultStats });
    
    console.log('✅ Default settings and stats initialized');
  } else if (details.reason === 'update') {
    console.log('🔄 Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Received message:', message.type, 'from tab:', sender.tab?.id);
  
  if (message.type === 'UPDATE_STATS') {
    // Update statistics from content script
    chrome.storage.local.get(['stats'], (result) => {
      const stats = result.stats || {
        messagesScanned: 0,
        violationsFound: 0,
        warningsIssued: 0
      };
      
      // Increment counters
      if (message.messagesScanned) {
        stats.messagesScanned += message.messagesScanned;
      }
      if (message.violationsFound) {
        stats.violationsFound += message.violationsFound;
      }
      if (message.warningsIssued) {
        stats.warningsIssued += message.warningsIssued;
      }
      
      stats.lastUpdated = new Date().toISOString();
      
      chrome.storage.local.set({ stats }, () => {
        console.log('📊 Stats updated:', stats);
        sendResponse({ success: true, stats });
      });
    });
    
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'UPDATE_BADGE') {
    // Update extension badge with violation count
    const count = message.count || 0;
    const tabId = sender.tab?.id;
    
    if (tabId) {
      if (count > 0) {
        chrome.action.setBadgeText({ text: String(count), tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#ef4444', tabId }); // Red
      } else {
        chrome.action.setBadgeText({ text: '✓', tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId }); // Green
      }
      
      console.log(`🏷️ Badge updated for tab ${tabId}: ${count > 0 ? count + ' violations' : 'safe'}`);
    }
    
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'GET_SETTINGS') {
    // Retrieve current settings
    chrome.storage.sync.get(['settings'], (result) => {
      sendResponse({ settings: result.settings });
    });
    return true;
  }
  
  if (message.type === 'VIOLATION_DETECTED') {
    // Log violation for potential future analytics
    console.warn('⚠️ Violation detected:', {
      platform: message.platform,
      severity: message.severity,
      categories: message.categories,
      timestamp: new Date().toISOString()
    });
    
    sendResponse({ success: true });
    return true;
  }
});

// Handle tab updates (user navigates to supported platform)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const url = tab.url || '';
    
    // Check if it's a supported AI platform
    const isChatGPT = url.includes('chat.openai.com');
    const isGemini = url.includes('gemini.google.com');
    const isClaude = url.includes('claude.ai');
    
    if (isChatGPT || isGemini || isClaude) {
      console.log('🌐 Supported AI platform loaded:', url);
      
      // Reset badge for new page load
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});

// Handle extension icon click (optional - badge click behavior)
chrome.action.onClicked.addListener((tab) => {
  console.log('🖱️ Extension icon clicked on tab:', tab.id);
  // Popup will open automatically due to "default_popup" in manifest
});

console.log('✅ Background service worker setup complete');
