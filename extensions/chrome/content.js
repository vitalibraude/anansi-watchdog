/**
 * Anansi Watchdog - Chrome Extension Content Script
 * Real-time AI safety monitoring for web-based AI assistants
 */

class AnansiWatchdog {
  constructor() {
    this.apiEndpoint = 'https://api.anansi-watchdog.com/v1';
    this.isEnabled = true;
    this.stats = {
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0
    };
    
    this.init();
  }
  
  async init() {
    console.log('🕷️ Anansi Watchdog initialized');
    
    // Load settings
    await this.loadSettings();
    
    // Detect AI platform
    this.platform = this.detectPlatform();
    console.log(`Platform detected: ${this.platform}`);
    
    // Start monitoring
    this.startMonitoring();
    
    // Inject UI
    this.injectSafetyIndicator();
  }
  
  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      enabled: true,
      apiKey: '',
      threshold: 0.8,
      showWarnings: true,
      blockUnsafe: false
    });
    
    this.settings = settings;
    this.isEnabled = settings.enabled;
  }
  
  detectPlatform() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('chat.openai.com')) return 'chatgpt';
    if (hostname.includes('gemini.google.com')) return 'gemini';
    if (hostname.includes('claude.ai')) return 'claude';
    if (hostname.includes('anthropic.com')) return 'claude';
    
    return 'unknown';
  }
  
  startMonitoring() {
    // Monitor for new AI responses
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanForAIResponses(node);
          }
        });
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also scan existing content
    this.scanForAIResponses(document.body);
  }
  
  async scanForAIResponses(element) {
    if (!this.isEnabled) return;
    
    // Platform-specific selectors
    const selectors = {
      chatgpt: '.markdown, .message-content',
      gemini: '.model-response, .response-container',
      claude: '.chat-message, .assistant-message'
    };
    
    const selector = selectors[this.platform];
    if (!selector) return;
    
    const messages = element.querySelectorAll(selector);
    
    for (const message of messages) {
      // Skip if already scanned
      if (message.dataset.anansiScanned) continue;
      
      const text = message.textContent;
      if (!text || text.length < 10) continue;
      
      // Mark as scanned
      message.dataset.anansiScanned = 'true';
      this.stats.messagesScanned++;
      
      // Perform safety check
      const result = await this.checkSafety(text);
      
      // Display results
      this.displaySafetyResult(message, result);
      
      // Take action if needed
      if (!result.is_safe) {
        this.stats.violationsFound++;
        this.handleUnsafeContent(message, result);
      }
    }
  }
  
  async checkSafety(text) {
    try {
      // Call Anansi API
      const response = await fetch(`${this.apiEndpoint}/safety/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.settings.apiKey || 'demo'
        },
        body: JSON.stringify({
          text: text,
          platform: this.platform
        })
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Safety check failed:', error);
      
      // Fallback to local checks
      return this.performLocalSafetyCheck(text);
    }
  }
  
  performLocalSafetyCheck(text) {
    // Local fallback safety checks
    const violations = [];
    
    // Check for dangerous content
    const dangerousPatterns = [
      /how to (make|create|build) (bomb|explosive|weapon)/i,
      /how to (hack|steal|break into)/i,
      /suicide (method|instructions)/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'dangerous_content',
          severity: 'critical',
          confidence: 0.9
        });
      }
    }
    
    // Check for hate speech
    const hatePatterns = [
      /(hate|kill) (all|every) (jews|muslims|blacks|whites|gays)/i,
      /deserve to die/i
    ];
    
    for (const pattern of hatePatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'hate_speech',
          severity: 'critical',
          confidence: 0.85
        });
      }
    }
    
    // Check for PII
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/,  // SSN
      /\b\d{16}\b/,  // Credit card
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i  // Email
    ];
    
    for (const pattern of piiPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'privacy',
          severity: 'high',
          confidence: 0.7
        });
      }
    }
    
    const is_safe = violations.length === 0;
    const safety_score = is_safe ? 1.0 : Math.max(0, 1.0 - (violations.length * 0.3));
    
    return {
      is_safe,
      safety_score,
      violations,
      source: 'local'
    };
  }
  
  displaySafetyResult(element, result) {
    // Remove existing indicator
    const existing = element.querySelector('.anansi-indicator');
    if (existing) existing.remove();
    
    // Create safety indicator
    const indicator = document.createElement('div');
    indicator.className = 'anansi-indicator';
    indicator.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
      cursor: pointer;
    `;
    
    if (result.is_safe) {
      indicator.style.background = '#10b981';
      indicator.style.color = 'white';
      indicator.innerHTML = '✓ Safe';
    } else {
      indicator.style.background = '#ef4444';
      indicator.style.color = 'white';
      indicator.innerHTML = '⚠ Warning';
      
      this.stats.warningsIssued++;
    }
    
    // Add score tooltip
    indicator.title = `Safety Score: ${(result.safety_score * 100).toFixed(1)}%\nViolations: ${result.violations.length}`;
    
    // Add click handler for details
    indicator.addEventListener('click', () => {
      this.showDetailedReport(result);
    });
    
    // Insert indicator
    element.appendChild(indicator);
  }
  
  handleUnsafeContent(element, result) {
    if (!this.settings.showWarnings) return;
    
    // Create warning banner
    const warning = document.createElement('div');
    warning.className = 'anansi-warning';
    warning.style.cssText = `
      background: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 12px;
      margin: 8px 0;
      font-size: 13px;
      color: #991b1b;
    `;
    
    const violationTypes = result.violations.map(v => v.category).join(', ');
    
    warning.innerHTML = `
      <strong>🛡️ Safety Warning</strong><br>
      This content may contain: ${violationTypes}<br>
      <small>Click for details</small>
    `;
    
    warning.addEventListener('click', () => {
      this.showDetailedReport(result);
    });
    
    // Insert warning before content
    element.parentNode.insertBefore(warning, element);
    
    // Optionally blur the content
    if (this.settings.blockUnsafe) {
      element.style.filter = 'blur(10px)';
      element.style.cursor = 'pointer';
      element.title = 'Click to reveal (content may be unsafe)';
      
      element.addEventListener('click', () => {
        element.style.filter = 'none';
      }, { once: true });
    }
  }
  
  showDetailedReport(result) {
    // Create modal with detailed safety report
    const modal = document.createElement('div');
    modal.className = 'anansi-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    content.innerHTML = `
      <h2 style="margin-top: 0;">🕷️ Anansi Safety Report</h2>
      <div style="margin: 16px 0;">
        <div style="font-size: 48px; font-weight: bold; color: ${result.is_safe ? '#10b981' : '#ef4444'};">
          ${(result.safety_score * 100).toFixed(1)}%
        </div>
        <div style="color: #6b7280;">Safety Score</div>
      </div>
      
      <h3>Status</h3>
      <p>${result.is_safe ? '✓ This content appears safe' : '⚠ Safety concerns detected'}</p>
      
      ${result.violations.length > 0 ? `
        <h3>Violations Found</h3>
        <ul>
          ${result.violations.map(v => `
            <li>
              <strong>${v.category}</strong> (${v.severity})
              <br><small>Confidence: ${(v.confidence * 100).toFixed(0)}%</small>
            </li>
          `).join('')}
        </ul>
      ` : ''}
      
      <div style="margin-top: 24px; text-align: right;">
        <button id="anansi-close" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on click
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'anansi-close') {
        modal.remove();
      }
    });
  }
  
  injectSafetyIndicator() {
    // Add persistent safety indicator to page
    const indicator = document.createElement('div');
    indicator.className = 'anansi-global-indicator';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s;
    `;
    
    indicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">🕷️</span>
        <div>
          <div style="font-weight: 600;">Anansi Watchdog</div>
          <div style="color: #10b981; font-size: 11px;">✓ Monitoring Active</div>
        </div>
      </div>
    `;
    
    indicator.addEventListener('click', () => {
      this.showStats();
    });
    
    indicator.addEventListener('mouseenter', () => {
      indicator.style.transform = 'scale(1.05)';
    });
    
    indicator.addEventListener('mouseleave', () => {
      indicator.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(indicator);
  }
  
  showStats() {
    alert(`📊 Anansi Watchdog Stats\n\n` +
          `Messages Scanned: ${this.stats.messagesScanned}\n` +
          `Violations Found: ${this.stats.violationsFound}\n` +
          `Warnings Issued: ${this.stats.warningsIssued}\n\n` +
          `Platform: ${this.platform}`);
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AnansiWatchdog();
  });
} else {
  new AnansiWatchdog();
}
