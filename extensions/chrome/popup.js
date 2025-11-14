/**
 * Anansi Watchdog - Popup Script
 * Manages extension settings and displays statistics
 */

// Load settings and stats when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadStats();
  setupEventListeners();
});

/**
 * Load current settings from Chrome storage
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get({
      enabled: true,
      apiKey: '',
      threshold: 0.8,
      showWarnings: true,
      blockUnsafe: false
    });
    
    // Update UI
    document.getElementById('enabledToggle').checked = settings.enabled;
    document.getElementById('showWarningsToggle').checked = settings.showWarnings;
    document.getElementById('blockUnsafeToggle').checked = settings.blockUnsafe;
    document.getElementById('apiKeyInput').value = settings.apiKey;
    document.getElementById('thresholdInput').value = Math.round(settings.threshold * 100);
    
  } catch (error) {
    console.error('Failed to load settings:', error);
    showStatus('שגיאה בטעינת הגדרות', 'error');
  }
}

/**
 * Load statistics from Chrome storage
 */
async function loadStats() {
  try {
    const stats = await chrome.storage.local.get({
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0
    });
    
    // Update UI
    document.getElementById('messagesScanned').textContent = stats.messagesScanned;
    document.getElementById('violationsFound').textContent = stats.violationsFound;
    document.getElementById('warningsIssued').textContent = stats.warningsIssued;
    
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Save button
  document.getElementById('saveButton').addEventListener('click', saveSettings);
  
  // Real-time threshold update
  const thresholdInput = document.getElementById('thresholdInput');
  thresholdInput.addEventListener('input', (e) => {
    // Validate range
    let value = parseInt(e.target.value);
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    e.target.value = value;
  });
  
  // API key visibility toggle
  const apiKeyInput = document.getElementById('apiKeyInput');
  let showApiKey = false;
  apiKeyInput.addEventListener('dblclick', () => {
    showApiKey = !showApiKey;
    apiKeyInput.type = showApiKey ? 'text' : 'password';
  });
}

/**
 * Save settings to Chrome storage
 */
async function saveSettings() {
  try {
    const settings = {
      enabled: document.getElementById('enabledToggle').checked,
      showWarnings: document.getElementById('showWarningsToggle').checked,
      blockUnsafe: document.getElementById('blockUnsafeToggle').checked,
      apiKey: document.getElementById('apiKeyInput').value.trim(),
      threshold: parseInt(document.getElementById('thresholdInput').value) / 100
    };
    
    // Validate threshold
    if (settings.threshold < 0 || settings.threshold > 1) {
      showStatus('סף בטיחות חייב להיות בין 0 ל-100', 'error');
      return;
    }
    
    // Save to storage
    await chrome.storage.sync.set(settings);
    
    // Show success message
    showStatus('✓ ההגדרות נשמרו בהצלחה!', 'success');
    
    // Notify content scripts to reload settings
    notifyContentScripts();
    
    // Auto-close popup after 1.5 seconds
    setTimeout(() => {
      window.close();
    }, 1500);
    
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('שגיאה בשמירת הגדרות', 'error');
  }
}

/**
 * Notify all content scripts to reload settings
 */
async function notifyContentScripts() {
  try {
    const tabs = await chrome.tabs.query({
      url: [
        'https://chat.openai.com/*',
        'https://gemini.google.com/*',
        'https://claude.ai/*'
      ]
    });
    
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SETTINGS_UPDATED'
      }).catch(err => {
        // Ignore errors for tabs where content script is not loaded
        console.log('Could not notify tab:', tab.id);
      });
    }
  } catch (error) {
    console.error('Failed to notify content scripts:', error);
  }
}

/**
 * Show status message
 */
function showStatus(message, type = 'success') {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusElement.className = 'status-message';
  }, 3000);
}

/**
 * Reset statistics
 */
async function resetStats() {
  if (!confirm('האם אתה בטוח שברצונך לאפס את הסטטיסטיקות?')) {
    return;
  }
  
  try {
    await chrome.storage.local.set({
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0
    });
    
    await loadStats();
    showStatus('✓ הסטטיסטיקות אופסו', 'success');
    
  } catch (error) {
    console.error('Failed to reset stats:', error);
    showStatus('שגיאה באיפוס סטטיסטיקות', 'error');
  }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveSettings();
  }
  
  // Escape to close
  if (e.key === 'Escape') {
    window.close();
  }
});
