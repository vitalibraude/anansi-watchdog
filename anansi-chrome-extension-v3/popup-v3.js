// Anansi Watchdog V3 - Popup Settings with No-AI Mode

console.log('🕷️ Popup V3 script loaded');

// DOM Elements
const messagesScannedEl = document.getElementById('messagesScanned');
const violationsFoundEl = document.getElementById('violationsFound');
const warningsIssuedEl = document.getElementById('warningsIssued');

// Detailed stats
const profanityCountEl = document.getElementById('profanityCount');
const manipulationCountEl = document.getElementById('manipulationCount');
const misleadingCountEl = document.getElementById('misleadingCount');
const scamCountEl = document.getElementById('scamCount');
const dangerousCountEl = document.getElementById('dangerousCount');
const totalDetectionsEl = document.getElementById('totalDetections');

// Stats cards (clickable to show detailed stats)
const statsCard1 = document.getElementById('statsCard1');
const statsCard2 = document.getElementById('statsCard2');
const statsCard3 = document.getElementById('statsCard3');
const detailedStats = document.getElementById('detailedStats');

// Mode buttons
const noAIMode = document.getElementById('noAIMode');
const aiMode = document.getElementById('aiMode');
const modeDescription = document.getElementById('modeDescription');

// Collapsible advanced settings
const advancedHeader = document.getElementById('advancedHeader');
const advancedContent = document.getElementById('advancedContent');

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
const screenshotsToggle = document.getElementById('screenshotsToggle');

const chatgptToggle = document.getElementById('chatgptToggle');
const geminiToggle = document.getElementById('geminiToggle');
const claudeToggle = document.getElementById('claudeToggle');

const saveButton = document.getElementById('saveButton');

// Current state
let currentDetectionMode = 'no-ai';
let detailedStatsExpanded = false;

// Load settings and stats on popup open
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, loading settings and stats...');
  loadSettings();
  loadStats();
  loadAPIKeys();
});

// Toggle detailed stats
[statsCard1, statsCard2, statsCard3].forEach(card => {
  card.addEventListener('click', () => {
    detailedStatsExpanded = !detailedStatsExpanded;
    if (detailedStatsExpanded) {
      detailedStats.classList.add('expanded');
    } else {
      detailedStats.classList.remove('expanded');
    }
  });
});

// Mode selection
noAIMode.addEventListener('click', () => {
  currentDetectionMode = 'no-ai';
  noAIMode.classList.add('active');
  aiMode.classList.remove('active');
  modeDescription.innerHTML = '🚀 מצב מהיר: 300+ דפוסים מובנים (ללא צורך ב-API, עובד אופליין)';
  modeDescription.style.background = 'rgba(16, 185, 129, 0.2)';
  modeDescription.style.borderColor = 'rgba(16, 185, 129, 0.3)';
});

aiMode.addEventListener('click', () => {
  currentDetectionMode = 'ai';
  aiMode.classList.add('active');
  noAIMode.classList.remove('active');
  modeDescription.innerHTML = '🤖 מצב AI: משתמש בGemini/ChatGPT לניתוח חכם (דרוש API key)';
  modeDescription.style.background = 'rgba(59, 130, 246, 0.2)';
  modeDescription.style.borderColor = 'rgba(59, 130, 246, 0.3)';
});

// Collapsible advanced settings
advancedHeader.addEventListener('click', () => {
  const arrow = advancedHeader.querySelector('.collapsible-arrow');
  const isExpanded = advancedContent.classList.contains('expanded');
  
  if (isExpanded) {
    advancedContent.classList.remove('expanded');
    arrow.classList.remove('expanded');
  } else {
    advancedContent.classList.add('expanded');
    arrow.classList.add('expanded');
  }
});

// Load current settings
function loadSettings() {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {
      enabled: true,
      showWarnings: true,
      detectionMode: 'no-ai',
      useScreenshots: false,
      enabledPlatforms: {
        chatgpt: true,
        gemini: true,
        claude: true
      }
    };
    
    console.log('⚙️ Loaded settings:', settings);
    
    // Apply settings
    enabledToggle.checked = settings.enabled;
    warningsToggle.checked = settings.showWarnings;
    screenshotsToggle.checked = settings.useScreenshots || false;
    
    chatgptToggle.checked = settings.enabledPlatforms.chatgpt;
    geminiToggle.checked = settings.enabledPlatforms.gemini;
    claudeToggle.checked = settings.enabledPlatforms.claude;
    
    // Set detection mode
    currentDetectionMode = settings.detectionMode || 'no-ai';
    if (currentDetectionMode === 'no-ai') {
      noAIMode.click();
    } else {
      aiMode.click();
    }
  });
}

// Load API keys
function loadAPIKeys() {
  chrome.storage.sync.get(['api_keys'], (result) => {
    const apiKeys = result.api_keys || {
      gemini: '',
      openai: '',
      claude: ''
    };
    
    console.log('🔑 API Keys loaded (masked)');
    
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
    element.textContent = '✓';
    element.className = 'api-status configured';
  } else {
    element.textContent = '⚠';
    element.className = 'api-status not-configured';
  }
}

// Load statistics
function loadStats() {
  chrome.storage.local.get(['stats', 'pattern_stats'], (result) => {
    const stats = result.stats || {
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0
    };
    
    const patternStats = result.pattern_stats || {
      profanityCount: 0,
      manipulationCount: 0,
      misleadingCount: 0,
      scamCount: 0,
      dangerousCount: 0
    };
    
    console.log('📊 Loaded stats:', stats, patternStats);
    
    // Animate main numbers
    animateNumber(messagesScannedEl, 0, stats.messagesScanned, 800);
    animateNumber(violationsFoundEl, 0, stats.violationsFound, 800);
    animateNumber(warningsIssuedEl, 0, stats.warningsIssued, 800);
    
    // Update detailed stats
    profanityCountEl.textContent = patternStats.profanityCount || 0;
    manipulationCountEl.textContent = patternStats.manipulationCount || 0;
    misleadingCountEl.textContent = patternStats.misleadingCount || 0;
    scamCountEl.textContent = patternStats.scamCount || 0;
    dangerousCountEl.textContent = patternStats.dangerousCount || 0;
    
    const total = Object.values(patternStats).reduce((a, b) => a + b, 0);
    totalDetectionsEl.textContent = total;
  });
}

// Animate number counting effect
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  const difference = end - start;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
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

// Save settings
saveButton.addEventListener('click', () => {
  console.log('💾 Saving settings...');
  
  const settings = {
    enabled: enabledToggle.checked,
    showWarnings: warningsToggle.checked,
    detectionMode: currentDetectionMode,
    useScreenshots: screenshotsToggle.checked,
    enabledPlatforms: {
      chatgpt: chatgptToggle.checked,
      gemini: geminiToggle.checked,
      claude: claudeToggle.checked
    }
  };
  
  const apiKeys = {
    gemini: geminiKeyInput.value.trim(),
    openai: openaiKeyInput.value.trim(),
    claude: claudeKeyInput.value.trim()
  };
  
  // Update API status
  updateAPIStatus(geminiStatus, !!apiKeys.gemini);
  updateAPIStatus(openaiStatus, !!apiKeys.openai);
  updateAPIStatus(claudeStatus, !!apiKeys.claude);
  
  // Save to storage
  chrome.storage.sync.set({ 
    settings,
    api_keys: apiKeys
  }, () => {
    console.log('✅ Settings saved');
    
    saveButton.textContent = '✅ נשמר!';
    saveButton.classList.add('saved');
    
    notifyContentScripts();
    
    setTimeout(() => {
      saveButton.textContent = '💾 שמור הגדרות';
      saveButton.classList.remove('saved');
      window.close();
    }, 1500);
  });
});

// Notify content scripts
function notifyContentScripts() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && (
        tab.url.includes('chat.openai.com') ||
        tab.url.includes('gemini.google.com') ||
        tab.url.includes('claude.ai')
      )) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('⚠️ Could not notify tab', tab.id);
          } else {
            console.log('📤 Notified tab', tab.id);
          }
        });
      }
    });
  });
}

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

// Keyboard shortcut for saving
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveButton.click();
  }
});

// Change listeners for visual feedback
const allToggles = [
  enabledToggle, warningsToggle, screenshotsToggle,
  chatgptToggle, geminiToggle, claudeToggle
];

allToggles.forEach(toggle => {
  toggle.addEventListener('change', () => {
    saveButton.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
      saveButton.style.animation = '';
    }, 500);
  });
});

[geminiKeyInput, openaiKeyInput, claudeKeyInput].forEach(input => {
  input.addEventListener('input', () => {
    saveButton.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
      saveButton.style.animation = '';
    }, 500);
  });
});

console.log('✅ Popup V3 script initialized');
