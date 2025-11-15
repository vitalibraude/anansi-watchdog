/**
 * Anansi Watchdog - Background Service Worker
 * Handles extension lifecycle, messaging, and storage
 */

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('🕷️ Anansi Watchdog installed:', details.reason);
  
  if (details.reason === 'install') {
    // First-time install
    await initializeExtension();
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://github.com/yourusername/anansi-watchdog'
    });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Updated from version:', details.previousVersion);
  }
});

/**
 * Initialize extension with default settings
 */
async function initializeExtension() {
  const defaultSettings = {
    enabled: true,
    apiKey: '',
    threshold: 0.8,
    showWarnings: true,
    blockUnsafe: false
  };
  
  const defaultStats = {
    messagesScanned: 0,
    violationsFound: 0,
    warningsIssued: 0,
    installDate: new Date().toISOString()
  };
  
  await chrome.storage.sync.set(defaultSettings);
  await chrome.storage.local.set(defaultStats);
  
  console.log('✓ Extension initialized with default settings');
}

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message.type, 'from tab:', sender.tab?.id);
  
  switch (message.type) {
    case 'UPDATE_STATS':
      handleStatsUpdate(message.data);
      sendResponse({ success: true });
      break;
      
    case 'GET_SETTINGS':
      handleGetSettings().then(sendResponse);
      return true; // Async response
      
    case 'VIOLATION_DETECTED':
      handleViolationDetected(message.data, sender.tab);
      sendResponse({ success: true });
      break;
      
    case 'CHECK_SAFETY':
      handleSafetyCheck(message.data).then(sendResponse);
      return true; // Async response
      
    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

/**
 * Update statistics in storage
 */
async function handleStatsUpdate(stats) {
  try {
    const current = await chrome.storage.local.get({
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0
    });
    
    const updated = {
      messagesScanned: current.messagesScanned + (stats.messagesScanned || 0),
      violationsFound: current.violationsFound + (stats.violationsFound || 0),
      warningsIssued: current.warningsIssued + (stats.warningsIssued || 0)
    };
    
    await chrome.storage.local.set(updated);
    
    // Update badge
    updateBadge(updated);
    
    console.log('✓ Stats updated:', updated);
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
}

/**
 * Get current settings
 */
async function handleGetSettings() {
  try {
    const settings = await chrome.storage.sync.get({
      enabled: true,
      apiKey: '',
      threshold: 0.8,
      showWarnings: true,
      blockUnsafe: false
    });
    
    return { success: true, settings };
  } catch (error) {
    console.error('Failed to get settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle violation detection
 */
async function handleViolationDetected(data, tab) {
  console.log('⚠️ Violation detected in tab:', tab.id, data);
  
  // Update badge to show warning
  chrome.action.setBadgeText({ text: '⚠', tabId: tab.id });
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444', tabId: tab.id });
  
  // Show notification if enabled
  const settings = await chrome.storage.sync.get({ showNotifications: true });
  if (settings.showNotifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🕷️ Anansi Watchdog Alert',
      message: `Detected: ${data.category}\nSeverity: ${data.severity}`,
      priority: 2
    });
  }
}

/**
 * Perform safety check (optional API integration)
 */
async function handleSafetyCheck(data) {
  try {
    const settings = await chrome.storage.sync.get({ apiKey: '' });
    
    if (!settings.apiKey) {
      // No API key - use local checks only
      return { success: true, useLocal: true };
    }
    
    // Call Anansi API
    const response = await fetch('https://api.anansi-watchdog.com/v1/safety/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': settings.apiKey
      },
      body: JSON.stringify({
        text: data.text,
        platform: data.platform
      })
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const result = await response.json();
    return { success: true, result };
    
  } catch (error) {
    console.error('Safety check failed:', error);
    return { success: false, error: error.message, useLocal: true };
  }
}

/**
 * Update extension badge
 */
function updateBadge(stats) {
  const violationCount = stats.violationsFound;
  
  if (violationCount === 0) {
    chrome.action.setBadgeText({ text: '' });
  } else if (violationCount < 10) {
    chrome.action.setBadgeText({ text: violationCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
  } else {
    chrome.action.setBadgeText({ text: '9+' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
}

/**
 * Listen for tab updates
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Check if tab is on supported AI platform
    const supportedDomains = [
      'chat.openai.com',
      'gemini.google.com',
      'claude.ai'
    ];
    
    const isSupported = supportedDomains.some(domain => 
      tab.url?.includes(domain)
    );
    
    if (isSupported) {
      console.log('✓ Anansi monitoring active on tab:', tabId);
      
      // Reset badge for this tab
      chrome.action.setBadgeText({ text: '✓', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId });
    }
  }
});

/**
 * Listen for tab removal (cleanup)
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('Tab closed:', tabId);
  // Cleanup is automatic with Chrome's badge system
});

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener((tab) => {
  // Open popup (default behavior is defined in manifest.json)
  console.log('Extension icon clicked on tab:', tab.id);
});

/**
 * Alarm for periodic tasks
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily-report') {
    generateDailyReport();
  }
});

// Set up daily report alarm
chrome.alarms.create('daily-report', {
  delayInMinutes: 1440, // 24 hours
  periodInMinutes: 1440
});

/**
 * Generate daily report
 */
async function generateDailyReport() {
  try {
    const stats = await chrome.storage.local.get({
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0
    });
    
    console.log('📊 Daily Report:', stats);
    
    // Could send to analytics, show notification, etc.
    
  } catch (error) {
    console.error('Failed to generate daily report:', error);
  }
}

/**
 * Context menu items (optional)
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'anansi-check-selection',
    title: 'Check safety with Anansi',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'anansi-check-selection') {
    const selectedText = info.selectionText;
    console.log('Checking selected text:', selectedText);
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
      type: 'CHECK_SELECTED_TEXT',
      text: selectedText
    });
  }
});

console.log('🕷️ Anansi Watchdog background service worker loaded');
