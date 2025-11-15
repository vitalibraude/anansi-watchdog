// Anansi Watchdog V2 - Popup Settings Management with API Keys

console.log('🕷️ Popup V2 script loaded');

// DOM Elements
const messagesScannedEl = document.getElementById('messagesScanned');
const violationsFoundEl = document.getElementById('violationsFound');
const warningsIssuedEl = document.getElementById('warningsIssued');

// API Key inputs
const geminiKeyInput = document.getElementById('geminiKey');
const openaiKeyInput = document.getElementById('openaiKey');
const claudeKeyInput = document.getElementById('claudeKey');

const geminiStatus = document.getElementById('geminiStatus');
const openaiStatus = document.getElementById('openaiStatus');
const claudeStatus = document.getElementById('claudeStatus');

// Setting toggles
const enabledToggle = document.getElementById('enabledToggle');
const warningsToggle = document.getElementById('warningsToggle');
const useAIToggle = document.getElementById('useAIToggle');
const screenshotsToggle = document.getElementById('screenshotsToggle');

const chatgptToggle = document.getElementById('chatgptToggle');
const geminiToggle = document.getElementById('geminiToggle');
const claudeToggle = document.getElementById('claudeToggle');

const saveButton = document.getElementById('saveButton');
const helpLink = document.getElementById('helpLink');

// Load settings and stats on popup open
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, loading settings and stats...');
  loadSettings();
  loadStats();
  loadAPIKeys();
});

// Load current settings from Chrome Storage
function loadSettings() {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {
      enabled: true,
      showWarnings: true,
      useAI: true,
      useScreenshots: false,
      enabledPlatforms: {
        chatgpt: true,
        gemini: true,
        claude: true
      }
    };
    
    console.log('⚙️ Loaded settings:', settings);
    
    // Apply settings to toggles
    enabledToggle.checked = settings.enabled;
    warningsToggle.checked = settings.showWarnings;
    useAIToggle.checked = settings.useAI !== false; // Default true
    screenshotsToggle.checked = settings.useScreenshots || false;
    
    chatgptToggle.checked = settings.enabledPlatforms.chatgpt;
    geminiToggle.checked = settings.enabledPlatforms.gemini;
    claudeToggle.checked = settings.enabledPlatforms.claude;
  });
}

// Load API keys and update status indicators
function loadAPIKeys() {
  chrome.storage.sync.get(['api_keys'], (result) => {
    const apiKeys = result.api_keys || {
      gemini: '',
      openai: '',
      claude: ''
    };
    
    console.log('🔑 API Keys loaded (masked)');
    
    // Set input values (masked)
    if (apiKeys.gemini) {
      geminiKeyInput.value = apiKeys.gemini;
      geminiKeyInput.type = 'password';
      updateAPIStatus(geminiStatus, true);
    }
    
    if (apiKeys.openai) {
      openaiKeyInput.value = apiKeys.openai;
      openaiKeyInput.type = 'password';
      updateAPIStatus(openaiStatus, true);
    }
    
    if (apiKeys.claude) {
      claudeKeyInput.value = apiKeys.claude;
      claudeKeyInput.type = 'password';
      updateAPIStatus(claudeStatus, true);
    }
  });
}

// Update API status indicator
function updateAPIStatus(element, configured) {
  if (configured) {
    element.textContent = '✓ מוגדר';
    element.className = 'api-status configured';
  } else {
    element.textContent = 'לא מוגדר';
    element.className = 'api-status not-configured';
  }
}

// Load statistics from Chrome Storage
function loadStats() {
  chrome.storage.local.get(['stats'], (result) => {
    const stats = result.stats || {
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0
    };
    
    console.log('📊 Loaded stats:', stats);
    
    // Animate numbers counting up
    animateNumber(messagesScannedEl, 0, stats.messagesScanned, 800);
    animateNumber(violationsFoundEl, 0, stats.violationsFound, 800);
    animateNumber(warningsIssuedEl, 0, stats.warningsIssued, 800);
  });
}

// Animate number counting effect
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  const difference = end - start;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + difference * easeOut);
    
    element.textContent = current.toLocaleString('he-IL');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end.toLocaleString('he-IL');
    }
  }
  
  requestAnimationFrame(update);
}

// Save settings when save button is clicked
saveButton.addEventListener('click', () => {
  console.log('💾 Saving settings and API keys...');
  
  // Gather settings
  const settings = {
    enabled: enabledToggle.checked,
    showWarnings: warningsToggle.checked,
    useAI: useAIToggle.checked,
    useScreenshots: screenshotsToggle.checked,
    enabledPlatforms: {
      chatgpt: chatgptToggle.checked,
      gemini: geminiToggle.checked,
      claude: claudeToggle.checked
    }
  };
  
  // Gather API keys
  const apiKeys = {
    gemini: geminiKeyInput.value.trim(),
    openai: openaiKeyInput.value.trim(),
    claude: claudeKeyInput.value.trim()
  };
  
  // Update API status indicators
  updateAPIStatus(geminiStatus, !!apiKeys.gemini);
  updateAPIStatus(openaiStatus, !!apiKeys.openai);
  updateAPIStatus(claudeStatus, !!apiKeys.claude);
  
  // Save to storage
  chrome.storage.sync.set({ 
    settings,
    api_keys: apiKeys
  }, () => {
    console.log('✅ Settings and API keys saved');
    
    // Visual feedback
    saveButton.textContent = '✅ נשמר!';
    saveButton.classList.add('saved');
    
    // Notify all content scripts of settings update
    notifyContentScripts();
    
    // Reset button after 1.5 seconds and close popup
    setTimeout(() => {
      saveButton.textContent = '💾 שמור הגדרות';
      saveButton.classList.remove('saved');
      window.close(); // Close the popup
    }, 1500);
  });
});

// Notify all active content scripts that settings were updated
function notifyContentScripts() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      // Only notify tabs on supported AI platforms
      if (tab.url && (
        tab.url.includes('chat.openai.com') ||
        tab.url.includes('gemini.google.com') ||
        tab.url.includes('claude.ai')
      )) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED'
        }, (response) => {
          // Ignore errors for tabs that don't have content script loaded yet
          if (chrome.runtime.lastError) {
            console.log('⚠️ Could not notify tab', tab.id, '- content script may not be loaded');
          } else {
            console.log('📤 Notified tab', tab.id, 'of settings update');
          }
        });
      }
    });
  });
}

// Help link - open API key documentation
helpLink.addEventListener('click', () => {
  chrome.tabs.create({
    url: 'https://github.com/anansi-platform/watchdog-extension/wiki/API-Keys-Setup'
  });
});

// Show/hide API key on double-click
geminiKeyInput.addEventListener('dblclick', () => {
  geminiKeyInput.type = geminiKeyInput.type === 'password' ? 'text' : 'password';
});

openaiKeyInput.addEventListener('dblclick', () => {
  openaiKeyInput.type = openaiKeyInput.type === 'password' ? 'text' : 'password';
});

claudeKeyInput.addEventListener('dblclick', () => {
  claudeKeyInput.type = claudeKeyInput.type === 'password' ? 'text' : 'password';
});

// Add keyboard shortcut for saving (Ctrl+S / Cmd+S)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveButton.click();
  }
});

// Add change listeners for instant feedback
const allToggles = [
  enabledToggle, warningsToggle, useAIToggle, screenshotsToggle,
  chatgptToggle, geminiToggle, claudeToggle
];

allToggles.forEach(toggle => {
  toggle.addEventListener('change', () => {
    // Add visual feedback that settings changed
    saveButton.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
      saveButton.style.animation = '';
    }, 500);
  });
});

// API key input change listeners
[geminiKeyInput, openaiKeyInput, claudeKeyInput].forEach(input => {
  input.addEventListener('input', () => {
    saveButton.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
      saveButton.style.animation = '';
    }, 500);
  });
});

console.log('✅ Popup V2 script initialized');
