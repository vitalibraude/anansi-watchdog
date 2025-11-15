// Anansi Watchdog - Popup Settings Management

console.log('🕷️ Popup script loaded');

// DOM Elements
const messagesScannedEl = document.getElementById('messagesScanned');
const violationsFoundEl = document.getElementById('violationsFound');
const warningsIssuedEl = document.getElementById('warningsIssued');

const enabledToggle = document.getElementById('enabledToggle');
const warningsToggle = document.getElementById('warningsToggle');
const chatgptToggle = document.getElementById('chatgptToggle');
const geminiToggle = document.getElementById('geminiToggle');
const claudeToggle = document.getElementById('claudeToggle');

const saveButton = document.getElementById('saveButton');

// Load settings and stats on popup open
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, loading settings and stats...');
  loadSettings();
  loadStats();
});

// Load current settings from Chrome Storage
function loadSettings() {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {
      enabled: true,
      showWarnings: true,
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
    chatgptToggle.checked = settings.enabledPlatforms.chatgpt;
    geminiToggle.checked = settings.enabledPlatforms.gemini;
    claudeToggle.checked = settings.enabledPlatforms.claude;
  });
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
  console.log('💾 Saving settings...');
  
  const settings = {
    enabled: enabledToggle.checked,
    showWarnings: warningsToggle.checked,
    enabledPlatforms: {
      chatgpt: chatgptToggle.checked,
      gemini: geminiToggle.checked,
      claude: claudeToggle.checked
    }
  };
  
  chrome.storage.sync.set({ settings }, () => {
    console.log('✅ Settings saved:', settings);
    
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

// Add keyboard shortcut for saving (Ctrl+S / Cmd+S)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveButton.click();
  }
});

// Add toggle change listeners for instant feedback
[enabledToggle, warningsToggle, chatgptToggle, geminiToggle, claudeToggle].forEach(toggle => {
  toggle.addEventListener('change', () => {
    // Add visual feedback that settings changed
    saveButton.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
      saveButton.style.animation = '';
    }, 500);
  });
});

console.log('✅ Popup script initialized');
