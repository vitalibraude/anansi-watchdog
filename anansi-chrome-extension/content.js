/**
 * Anansi Watchdog - Content Script
 * Real-time AI safety monitoring
 */

class AnansiWatchdog {
  constructor() {
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
    await this.loadSettings();
    this.platform = this.detectPlatform();
    console.log(`Platform: ${this.platform}`);
    this.startMonitoring();
    this.injectSafetyIndicator();
  }
  
  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      enabled: true,
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
    return 'unknown';
  }
  
  startMonitoring() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanForAIResponses(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.scanForAIResponses(document.body);
  }
  
  async scanForAIResponses(element) {
    if (!this.isEnabled) return;
    
    const selectors = {
      chatgpt: '.markdown, .message-content, [data-message-author-role="assistant"]',
      gemini: '.model-response, .response-container, [class*="response"]',
      claude: '.chat-message, .assistant-message, [data-role="assistant"]'
    };
    
    const selector = selectors[this.platform];
    if (!selector) return;
    
    const messages = element.querySelectorAll(selector);
    
    for (const message of messages) {
      if (message.dataset.anansiScanned) continue;
      
      const text = message.textContent;
      if (!text || text.length < 10) continue;
      
      message.dataset.anansiScanned = 'true';
      this.stats.messagesScanned++;
      
      const result = await this.checkSafety(text);
      this.displaySafetyResult(message, result);
      
      if (!result.is_safe) {
        this.stats.violationsFound++;
        this.handleUnsafeContent(message, result);
      }
    }
  }
  
  async checkSafety(text) {
    return this.performLocalSafetyCheck(text);
  }
  
  performLocalSafetyCheck(text) {
    const violations = [];
    
    // Sales manipulation
    if (/(buy|purchase|order) (now|today|immediately)/i.test(text) ||
        /special (offer|discount|deal) (for you|today only)/i.test(text) ||
        /\d+% (off|discount) if you (buy|act) now/i.test(text) ||
        /don't miss (out|this)/i.test(text) ||
        /only \d+ (left|remaining|available)/i.test(text)) {
      violations.push({
        category: 'sales_manipulation',
        severity: 'high',
        confidence: 0.85,
        description: 'Detected aggressive sales tactics',
        tactics: ['hard_sell', 'fomo', 'false_scarcity', 'pressure_discount']
      });
    }
    
    // Emotional manipulation
    if (/you (should|must|need to) feel (guilty|ashamed|bad)/i.test(text) ||
        /(everyone|nobody) (thinks|believes) (you|this)/i.test(text) ||
        /if you (loved|cared about) me/i.test(text) ||
        /you('re| are) (crazy|paranoid|overreacting)/i.test(text) ||
        /you (owe|should do this for) me/i.test(text)) {
      violations.push({
        category: 'manipulation',
        severity: 'high',
        confidence: 0.8,
        description: 'Detected emotional manipulation',
        tactics: ['guilt_tripping', 'social_pressure', 'emotional_blackmail', 'gaslighting']
      });
    }
    
    // Fear mongering
    if (/if you don't (do|buy|act) (now|immediately)/i.test(text) ||
        /you (will|might) (lose|miss|regret)/i.test(text) ||
        /(danger|threat|risk) if you don't/i.test(text) ||
        /time is running out/i.test(text) ||
        /last (chance|opportunity)/i.test(text)) {
      violations.push({
        category: 'manipulation',
        severity: 'high',
        confidence: 0.75,
        description: 'Detected fear-based manipulation',
        tactics: ['fear_mongering', 'artificial_urgency']
      });
    }
    
    // Phishing
    if (/your account (has been|will be) (suspended|locked|closed)/i.test(text) ||
        /verify your (account|identity|information)/i.test(text) ||
        /unusual (activity|login) detected/i.test(text) ||
        /confirm your (email|password|payment)/i.test(text) ||
        /update your (payment|billing) information/i.test(text) ||
        /click (here|this link|below) (immediately|now)/i.test(text)) {
      violations.push({
        category: 'phishing',
        severity: 'critical',
        confidence: 0.9,
        description: 'Potential phishing attempt detected'
      });
    }
    
    // Scams
    if (/make \$\d+,?\d* (per day|per week|per hour) (from home|online)/i.test(text) ||
        /guaranteed (profit|return|income)/i.test(text) ||
        /no (risk|experience) (required|needed)/i.test(text) ||
        /pay \$?\d+ (upfront|first|now) to (receive|get|unlock)/i.test(text) ||
        /\d+% (return|roi|profit) guaranteed/i.test(text)) {
      violations.push({
        category: 'scam',
        severity: 'critical',
        confidence: 0.85,
        description: 'Potential scam detected'
      });
    }
    
    // Dangerous content
    if (/how to (make|create|build) (bomb|explosive|weapon)/i.test(text) ||
        /how to (hack|steal|break into)/i.test(text) ||
        /suicide (method|instructions)/i.test(text)) {
      violations.push({
        category: 'dangerous_content',
        severity: 'critical',
        confidence: 0.95,
        description: 'Detected dangerous or harmful content'
      });
    }
    
    const is_safe = violations.length === 0;
    const safety_score = is_safe ? 1.0 : Math.max(0, 1.0 - (violations.length * 0.25));
    
    return {
      is_safe,
      safety_score,
      violations,
      source: 'local'
    };
  }
  
  displaySafetyResult(element, result) {
    const existing = element.querySelector('.anansi-indicator');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.className = 'anansi-indicator';
    indicator.style.cssText = `
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      padding: 2px 8px !important;
      border-radius: 12px !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      margin-left: 8px !important;
      cursor: pointer !important;
      transition: transform 0.2s ease !important;
      z-index: 1000 !important;
      position: relative !important;
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
    
    indicator.title = `Safety: ${(result.safety_score * 100).toFixed(1)}%\nViolations: ${result.violations.length}`;
    
    indicator.addEventListener('click', () => {
      this.showDetailedReport(result);
    });
    
    element.appendChild(indicator);
  }
  
  handleUnsafeContent(element, result) {
    if (!this.settings.showWarnings) return;
    
    const warning = document.createElement('div');
    warning.className = 'anansi-warning';
    warning.style.cssText = `
      background: #fef2f2 !important;
      border: 2px solid #ef4444 !important;
      border-radius: 8px !important;
      padding: 12px !important;
      margin: 8px 0 !important;
      font-size: 13px !important;
      color: #991b1b !important;
      cursor: pointer !important;
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
    
    element.parentNode.insertBefore(warning, element);
    
    if (this.settings.blockUnsafe) {
      element.style.filter = 'blur(10px)';
      element.style.cursor = 'pointer';
      element.addEventListener('click', () => {
        element.style.filter = 'none';
      }, { once: true });
    }
  }
  
  showDetailedReport(result) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.8) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 999999 !important;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white !important;
      border-radius: 12px !important;
      padding: 24px !important;
      max-width: 600px !important;
      max-height: 80vh !important;
      overflow-y: auto !important;
      color: #333 !important;
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
        <h3>⚠️ Issues Detected</h3>
        <ul style="list-style: none; padding: 0;">
          ${result.violations.map(v => `
            <li style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 8px 0; border-radius: 4px;">
              <div>
                <strong style="color: #991b1b; text-transform: capitalize;">${v.category.replace(/_/g, ' ')}</strong>
                <span style="background: ${v.severity === 'critical' ? '#dc2626' : v.severity === 'high' ? '#ea580c' : '#f59e0b'}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 6px;">${v.severity.toUpperCase()}</span>
                ${v.description ? `<br><small style="color: #6b7280;">${v.description}</small>` : ''}
                ${v.tactics && v.tactics.length > 0 ? `
                  <br><div style="margin-top: 6px;">
                    <strong style="font-size: 11px;">Tactics:</strong>
                    ${v.tactics.map(t => `<span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin: 2px; display: inline-block;">${t.replace(/_/g, ' ')}</span>`).join('')}
                  </div>
                ` : ''}
                <div style="text-align: right; margin-top: 6px;">
                  <span style="font-size: 12px; font-weight: bold; color: #991b1b;">${(v.confidence * 100).toFixed(0)}% confidence</span>
                </div>
              </div>
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
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'anansi-close') {
        modal.remove();
      }
    });
  }
  
  injectSafetyIndicator() {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: white !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      padding: 12px 16px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
      z-index: 99999 !important;
      font-size: 12px !important;
      cursor: pointer !important;
      transition: all 0.3s !important;
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

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.anansiWatchdog = new AnansiWatchdog();
  });
} else {
  window.anansiWatchdog = new AnansiWatchdog();
}
