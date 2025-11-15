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
      
      // Update background stats
      this.updateBackgroundStats();
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
          confidence: 0.9,
          description: 'Detected dangerous or harmful instructions'
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
          confidence: 0.85,
          description: 'Detected hate speech or discriminatory content'
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
          confidence: 0.7,
          description: 'Detected potential PII (Personal Identifiable Information)'
        });
      }
    }
    
    // 🚨 NEW: Check for MANIPULATION tactics
    const manipulationCheck = this.detectManipulation(text);
    if (manipulationCheck.detected) {
      violations.push({
        category: 'manipulation',
        severity: manipulationCheck.severity,
        confidence: manipulationCheck.confidence,
        description: manipulationCheck.description,
        tactics: manipulationCheck.tactics
      });
    }
    
    // 🚨 NEW: Check for SALES/MARKETING tactics
    const salesCheck = this.detectSalesTactics(text);
    if (salesCheck.detected) {
      violations.push({
        category: 'sales_manipulation',
        severity: salesCheck.severity,
        confidence: salesCheck.confidence,
        description: salesCheck.description,
        tactics: salesCheck.tactics
      });
    }
    
    // 🚨 NEW: Check for PHISHING attempts
    const phishingCheck = this.detectPhishing(text);
    if (phishingCheck.detected) {
      violations.push({
        category: 'phishing',
        severity: 'critical',
        confidence: phishingCheck.confidence,
        description: phishingCheck.description
      });
    }
    
    // 🚨 NEW: Check for SCAM patterns
    const scamCheck = this.detectScam(text);
    if (scamCheck.detected) {
      violations.push({
        category: 'scam',
        severity: 'critical',
        confidence: scamCheck.confidence,
        description: scamCheck.description
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
  
  detectManipulation(text) {
    // Detect psychological manipulation tactics
    const tactics = [];
    let maxSeverity = 'medium';
    let confidence = 0;
    
    // Emotional manipulation
    const emotionalPatterns = [
      { pattern: /you (should|must|need to) feel (guilty|ashamed|bad)/i, tactic: 'guilt_tripping' },
      { pattern: /(everyone|nobody) (thinks|believes) (you|this)/i, tactic: 'social_pressure' },
      { pattern: /if you (loved|cared about) me/i, tactic: 'emotional_blackmail' },
      { pattern: /you('re| are) (crazy|paranoid|overreacting)/i, tactic: 'gaslighting' },
      { pattern: /you (owe|should do this for) me/i, tactic: 'obligation' }
    ];
    
    for (const {pattern, tactic} of emotionalPatterns) {
      if (pattern.test(text)) {
        tactics.push(tactic);
        confidence += 0.15;
        maxSeverity = 'high';
      }
    }
    
    // Fear-based manipulation
    const fearPatterns = [
      /if you don't (do|buy|act) (now|immediately)/i,
      /you (will|might) (lose|miss|regret)/i,
      /(danger|threat|risk) if you don't/i,
      /time is running out/i,
      /last (chance|opportunity)/i
    ];
    
    for (const pattern of fearPatterns) {
      if (pattern.test(text)) {
        tactics.push('fear_mongering');
        confidence += 0.12;
        maxSeverity = 'high';
      }
    }
    
    // Urgency pressure
    const urgencyPatterns = [
      /(act|buy|decide) (now|immediately|today)/i,
      /limited (time|offer|spots)/i,
      /only \d+ (left|remaining|available)/i,
      /expires (today|soon|in \d+ hours)/i
    ];
    
    for (const pattern of urgencyPatterns) {
      if (pattern.test(text)) {
        tactics.push('artificial_urgency');
        confidence += 0.1;
      }
    }
    
    // Authority manipulation
    const authorityPatterns = [
      /(experts|doctors|scientists) (agree|recommend|say)/i,
      /studies (show|prove)/i,
      /trust me, i('m| am) (an expert|a professional)/i,
      /as your (friend|advisor)/i
    ];
    
    for (const pattern of authorityPatterns) {
      if (pattern.test(text)) {
        tactics.push('false_authority');
        confidence += 0.08;
      }
    }
    
    // Reciprocity manipulation
    const reciprocityPatterns = [
      /i (did|gave) (this|so much) for you/i,
      /after (all|everything) i('ve| have) done/i,
      /you should (return|repay) the favor/i
    ];
    
    for (const pattern of reciprocityPatterns) {
      if (pattern.test(text)) {
        tactics.push('forced_reciprocity');
        confidence += 0.1;
      }
    }
    
    const detected = tactics.length > 0;
    confidence = Math.min(confidence, 0.95);
    
    return {
      detected,
      severity: maxSeverity,
      confidence,
      tactics: [...new Set(tactics)],
      description: detected ? `Detected manipulation tactics: ${[...new Set(tactics)].join(', ')}` : ''
    };
  }
  
  detectSalesTactics(text) {
    // Detect aggressive sales/marketing tactics
    const tactics = [];
    let confidence = 0;
    
    // Aggressive selling
    const aggressivePatterns = [
      { pattern: /(buy|purchase|order) (now|today|immediately)/i, tactic: 'hard_sell' },
      { pattern: /special (offer|discount|deal) (for you|today only)/i, tactic: 'false_scarcity' },
      { pattern: /\d+% (off|discount) if you (buy|act) now/i, tactic: 'pressure_discount' },
      { pattern: /free (gift|bonus) if you (order|buy) (now|today)/i, tactic: 'incentive_pressure' },
      { pattern: /don't miss (out|this)/i, tactic: 'fomo' }
    ];
    
    for (const {pattern, tactic} of aggressivePatterns) {
      if (pattern.test(text)) {
        tactics.push(tactic);
        confidence += 0.15;
      }
    }
    
    // Hidden costs
    const costPatterns = [
      /just \$?\d+/i,
      /only \$?\d+ (dollars|euros|pounds)/i,
      /small (payment|fee|investment)/i
    ];
    
    // Check if price mentioned without clear terms
    for (const pattern of costPatterns) {
      if (pattern.test(text) && !/\b(per|monthly|yearly|subscription)\b/i.test(text)) {
        tactics.push('hidden_costs');
        confidence += 0.12;
      }
    }
    
    // MLM/Pyramid scheme indicators
    const mlmPatterns = [
      /be your own boss/i,
      /work from home.*unlimited income/i,
      /recruit (friends|family|others)/i,
      /passive income/i,
      /financial freedom/i
    ];
    
    let mlmCount = 0;
    for (const pattern of mlmPatterns) {
      if (pattern.test(text)) {
        mlmCount++;
      }
    }
    
    if (mlmCount >= 2) {
      tactics.push('mlm_scheme');
      confidence += 0.2;
    }
    
    // Fake testimonials
    const testimonialPatterns = [
      /i made \$\d+,?\d* in \d+ (days|weeks|months)/i,
      /changed my life/i,
      /you won't believe/i
    ];
    
    for (const pattern of testimonialPatterns) {
      if (pattern.test(text)) {
        tactics.push('fake_testimonials');
        confidence += 0.1;
      }
    }
    
    const detected = tactics.length > 0;
    confidence = Math.min(confidence, 0.95);
    
    let severity = 'medium';
    if (tactics.includes('mlm_scheme')) severity = 'critical';
    else if (confidence > 0.3) severity = 'high';
    
    return {
      detected,
      severity,
      confidence,
      tactics: [...new Set(tactics)],
      description: detected ? `Detected sales manipulation: ${[...new Set(tactics)].join(', ')}` : ''
    };
  }
  
  detectPhishing(text) {
    // Detect phishing attempts
    let confidence = 0;
    const indicators = [];
    
    // Urgent account issues
    const accountPatterns = [
      /your account (has been|will be) (suspended|locked|closed)/i,
      /verify your (account|identity|information)/i,
      /unusual (activity|login) detected/i,
      /confirm your (email|password|payment)/i,
      /update your (payment|billing) information/i
    ];
    
    for (const pattern of accountPatterns) {
      if (pattern.test(text)) {
        indicators.push('account_urgency');
        confidence += 0.2;
      }
    }
    
    // Link pressure
    const linkPatterns = [
      /click (here|this link|below) (immediately|now)/i,
      /(verify|confirm) by clicking/i,
      /follow this link to (avoid|prevent)/i
    ];
    
    for (const pattern of linkPatterns) {
      if (pattern.test(text)) {
        indicators.push('link_pressure');
        confidence += 0.15;
      }
    }
    
    // Prize/reward scams
    const prizePatterns = [
      /you('ve| have) won/i,
      /congratulations.*winner/i,
      /claim your (prize|reward|gift)/i,
      /selected as (winner|recipient)/i
    ];
    
    for (const pattern of prizePatterns) {
      if (pattern.test(text)) {
        indicators.push('fake_prize');
        confidence += 0.2;
      }
    }
    
    // Suspicious credentials requests
    const credentialPatterns = [
      /(enter|provide|send) your (password|credit card|ssn|social security)/i,
      /confirm your (login|credentials)/i
    ];
    
    for (const pattern of credentialPatterns) {
      if (pattern.test(text)) {
        indicators.push('credential_theft');
        confidence += 0.3;
      }
    }
    
    const detected = indicators.length > 0;
    confidence = Math.min(confidence, 0.95);
    
    return {
      detected,
      confidence,
      description: detected ? `Potential phishing attempt detected: ${indicators.join(', ')}` : ''
    };
  }
  
  detectScam(text) {
    // Detect common scam patterns
    let confidence = 0;
    const scamTypes = [];
    
    // Too good to be true
    const tgtbtPatterns = [
      /make \$\d+,?\d* (per day|per week|per hour) (from home|online)/i,
      /guaranteed (profit|return|income)/i,
      /no (risk|experience) (required|needed)/i,
      /turn \$\d+ into \$\d+,?\d+ in \d+ (days|weeks)/i
    ];
    
    for (const pattern of tgtbtPatterns) {
      if (pattern.test(text)) {
        scamTypes.push('too_good_to_be_true');
        confidence += 0.2;
      }
    }
    
    // Advance fee fraud
    const advanceFeePatterns = [
      /pay \$?\d+ (upfront|first|now) to (receive|get|unlock)/i,
      /small (fee|payment) to (claim|receive|access)/i,
      /processing fee/i
    ];
    
    for (const pattern of advanceFeePatterns) {
      if (pattern.test(text)) {
        scamTypes.push('advance_fee_fraud');
        confidence += 0.25;
      }
    }
    
    // Investment scams
    const investmentPatterns = [
      /\d+% (return|roi|profit) guaranteed/i,
      /crypto (investment|trading) (opportunity|secret)/i,
      /insider (information|tip)/i,
      /risk-free investment/i
    ];
    
    for (const pattern of investmentPatterns) {
      if (pattern.test(text)) {
        scamTypes.push('investment_scam');
        confidence += 0.2;
      }
    }
    
    // Romance scam indicators
    const romancePatterns = [
      /i (love|care about) you.*send (money|gift cards)/i,
      /emergency.*need (money|financial help)/i,
      /help me (leave|escape).*money/i
    ];
    
    for (const pattern of romancePatterns) {
      if (pattern.test(text)) {
        scamTypes.push('romance_scam');
        confidence += 0.3;
      }
    }
    
    const detected = scamTypes.length > 0;
    confidence = Math.min(confidence, 0.95);
    
    return {
      detected,
      confidence,
      description: detected ? `Potential scam detected: ${scamTypes.join(', ')}` : ''
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
        <h3>⚠️ Issues Detected</h3>
        <ul style="list-style: none; padding: 0;">
          ${result.violations.map(v => `
            <li style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 8px 0; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: start;">
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
                </div>
                <div style="text-align: right; min-width: 60px;">
                  <div style="font-size: 14px; font-weight: bold; color: #991b1b;">${(v.confidence * 100).toFixed(0)}%</div>
                  <div style="font-size: 9px; color: #6b7280;">confidence</div>
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
  
  updateBackgroundStats() {
    // Send stats to background for persistence
    try {
      chrome.runtime.sendMessage({
        type: 'UPDATE_STATS',
        data: {
          messagesScanned: 1,
          violationsFound: this.stats.violationsFound > 0 ? 1 : 0,
          warningsIssued: this.stats.warningsIssued > 0 ? 1 : 0
        }
      });
    } catch (error) {
      // Ignore errors (background script might not be loaded)
      console.log('Could not update background stats');
    }
  }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    // Reload settings
    if (window.anansiWatchdog) {
      window.anansiWatchdog.loadSettings();
    }
  } else if (message.type === 'CHECK_SELECTED_TEXT') {
    // Check selected text safety
    if (window.anansiWatchdog) {
      window.anansiWatchdog.checkSafety(message.text).then(result => {
        window.anansiWatchdog.showDetailedReport(result);
      });
    }
  }
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.anansiWatchdog = new AnansiWatchdog();
  });
} else {
  window.anansiWatchdog = new AnansiWatchdog();
}
