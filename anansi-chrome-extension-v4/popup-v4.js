/**
 * Anansi Watchdog V4 - Popup Script
 * Extension popup interface logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load current stats
  await loadStats();
  
  // Load settings
  await loadSettings();
  
  // Setup event listeners
  setupEventListeners();
  
  // Update stats every 2 seconds
  setInterval(loadStats, 2000);
});

async function loadStats() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
      if (response && response.stats) {
        updateStatsDisplay(response.stats);
      }
    });
    
    // Also get from background
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
      if (response && response.stats) {
        updateStatsDisplay(response.stats);
      }
    });
  } catch (error) {
    console.log('Could not load stats:', error);
  }
}

function updateStatsDisplay(stats) {
  document.getElementById('scanned').textContent = stats.messagesScanned || 0;
  document.getElementById('threats').textContent = stats.threatsDetected || 0;
  document.getElementById('screenshots').textContent = stats.screenshotsAnalyzed || 0;
  document.getElementById('scams').textContent = stats.scamsBlocked || 0;
}

async function loadSettings() {
  const settings = await chrome.storage.sync.get({
    enabled: true,
    blockScams: true,
    showWarnings: true
  });
  
  // Update toggle states
  updateToggle('toggle-enabled', settings.enabled);
  updateToggle('toggle-block', settings.blockScams);
  updateToggle('toggle-warnings', settings.showWarnings);
}

function updateToggle(id, active) {
  const toggle = document.getElementById(id);
  if (active) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
}

function setupEventListeners() {
  // Toggle switches
  document.getElementById('toggle-enabled').addEventListener('click', async (e) => {
    const isActive = e.target.classList.toggle('active');
    await chrome.storage.sync.set({ enabled: isActive });
    
    // Reload content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.reload(tab.id);
  });
  
  document.getElementById('toggle-block').addEventListener('click', async (e) => {
    const isActive = e.target.classList.toggle('active');
    await chrome.storage.sync.set({ blockScams: isActive });
  });
  
  document.getElementById('toggle-warnings').addEventListener('click', async (e) => {
    const isActive = e.target.classList.toggle('active');
    await chrome.storage.sync.set({ showWarnings: isActive });
  });
  
  // Scan screenshot button
  document.getElementById('btn-scan').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'captureScreenshot' }, (response) => {
      if (chrome.runtime.lastError) {
        showNotification('Please refresh the page to enable screenshot capture', 'warning');
      } else {
        window.close();
      }
    });
  });
  
  // Settings button
  document.getElementById('btn-settings').addEventListener('click', () => {
    showSettings();
  });
}

function showSettings() {
  // Create settings modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
  `;
  
  modal.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 18px; margin-bottom: 8px;">Advanced Settings</h2>
      <p style="font-size: 12px; color: #6b7280;">Configure Anansi Watchdog V4</p>
    </div>
    
    <div style="margin-bottom: 16px;">
      <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
        API Key (Optional)
      </label>
      <input type="text" id="api-key" placeholder="Enter your API key for advanced features" style="
        width: 100%;
        padding: 10px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 13px;
      ">
      <p style="font-size: 11px; color: #6b7280; margin-top: 4px;">
        Get an API key at anansi-watchdog.com for enhanced detection
      </p>
    </div>
    
    <div style="margin-bottom: 16px;">
      <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
        Safety Threshold
      </label>
      <input type="range" id="threshold" min="0" max="100" value="80" style="width: 100%;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6b7280; margin-top: 4px;">
        <span>Lenient</span>
        <span id="threshold-value">80%</span>
        <span>Strict</span>
      </div>
    </div>
    
    <div style="display: flex; gap: 8px; margin-top: 24px;">
      <button id="save-settings" style="
        flex: 1;
        padding: 12px;
        background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">Save Settings</button>
      <button id="cancel-settings" style="
        flex: 1;
        padding: 12px;
        background: #f3f4f6;
        color: #6b7280;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">Cancel</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Load current settings
  chrome.storage.sync.get(['apiKey', 'threshold'], (settings) => {
    if (settings.apiKey) {
      document.getElementById('api-key').value = settings.apiKey;
    }
    if (settings.threshold) {
      const thresholdPercent = Math.round(settings.threshold * 100);
      document.getElementById('threshold').value = thresholdPercent;
      document.getElementById('threshold-value').textContent = thresholdPercent + '%';
    }
  });
  
  // Update threshold display
  document.getElementById('threshold').addEventListener('input', (e) => {
    document.getElementById('threshold-value').textContent = e.target.value + '%';
  });
  
  // Save button
  document.getElementById('save-settings').addEventListener('click', async () => {
    const apiKey = document.getElementById('api-key').value;
    const threshold = parseInt(document.getElementById('threshold').value) / 100;
    
    await chrome.storage.sync.set({ apiKey, threshold });
    
    showNotification('Settings saved successfully!', 'success');
    modal.remove();
  });
  
  // Cancel button
  document.getElementById('cancel-settings').addEventListener('click', () => {
    modal.remove();
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}
