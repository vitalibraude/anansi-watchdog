/**
 * Anansi Watchdog V2 - Content Script with AI Analysis
 * Real-time AI safety monitoring using external AI APIs
 */

class AnansiWatchdogV2 {
  constructor() {
    this.isEnabled = true;
    this.useAI = true; // Use AI analysis when available
    this.useScreenshots = false; // Screenshot analysis (expensive)
    this.stats = {
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0,
      apiCalls: 0,
      cacheHits: 0
    };
    
    // Initialize modules
    this.aiAnalyzer = new AIAnalyzer();
    this.screenshotCapture = new ScreenshotCapture();
    
    this.init();
  }
  
  async init() {
    console.log('🕷️ Anansi Watchdog V2 initialized (AI-powered)');
    await this.loadSettings();
    this.platform = this.detectPlatform();
    console.log(`Platform: ${this.platform}`);
    
    // Check if AI APIs are configured
    const hasAPI = this.aiAnalyzer.hasAPIKey();
    console.log(`AI Analysis: ${hasAPI ? '✅ Enabled' : '❌ Disabled (no API key)'}`);
    
    this.startMonitoring();
    this.injectGlobalIndicator();
    
    // Listen for settings updates
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SETTINGS_UPDATED') {
        this.loadSettings();
        sendResponse({ success: true });
      }
    });
  }
  
  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      enabled: true,
      threshold: 0.7,
      showWarnings: true,
      blockUnsafe: false,
      useAI: true,
      useScreenshots: false,
      enabledPlatforms: {
        chatgpt: true,
        gemini: true,
        claude: true
      }
    });
    
    this.settings = settings;
    this.isEnabled = settings.enabled && settings.enabledPlatforms[this.platform];
    this.useAI = settings.useAI;
    this.useScreenshots = settings.useScreenshots;
    
    console.log('⚙️ Settings loaded:', this.settings);
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
    
    // Initial scan
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
      
      const text = message.textContent.trim();
      if (!text || text.length < 20) continue; // Skip very short messages
      
      message.dataset.anansiScanned = 'true';
      this.stats.messagesScanned++;
      
      // Show loading indicator
      this.showLoadingIndicator(message);
      
      try {
        // Analyze with AI or fallback to regex
        const result = await this.checkSafety(text, message);
        
        this.displaySafetyResult(message, result);
        
        if (!result.is_safe) {
          this.stats.violationsFound++;
          this.handleUnsafeContent(message, result);
        }
        
        // Update global indicator
        this.updateGlobalIndicator();
        
        // Send stats to background
        this.updateStats();
        
      } catch (error) {
        console.error('🕷️ Analysis error:', error);
        // Fallback to local regex analysis
        const fallbackResult = await this.performLocalSafetyCheck(text);
        this.displaySafetyResult(message, fallbackResult);
      }
    }
  }
  
  async checkSafety(text, element) {
    // Strategy: Try AI first, fallback to regex
    
    // Option 1: AI Analysis (if enabled and API available)
    if (this.useAI && this.aiAnalyzer.hasAPIKey()) {
      try {
        console.log('🕷️ Using AI analysis...');
        const result = await this.aiAnalyzer.analyzeMessage(text, this.platform);
        this.stats.apiCalls++;
        return result;
      } catch (error) {
        console.warn('🕷️ AI analysis failed, falling back to regex:', error);
      }
    }
    
    // Option 2: Screenshot Analysis (if enabled and text extraction failed)
    if (this.useScreenshots && element) {
      try {
        console.log('🕷️ Using screenshot analysis...');
        const screenshot = await this.screenshotCapture.captureElement(element);
        if (screenshot) {
          const result = await this.aiAnalyzer.analyzeScreenshot(screenshot, this.platform);
          this.stats.apiCalls++;
          return result;
        }
      } catch (error) {
        console.warn('🕷️ Screenshot analysis failed:', error);
      }
    }
    
    // Option 3: Local Regex Patterns (fallback)
    console.log('🕷️ Using local regex analysis (fallback)');
    return await this.performLocalSafetyCheck(text);
  }
  
  performLocalSafetyCheck(text) {
    const violations = [];
    
    // Sales manipulation patterns
    const salesPatterns = [
      { pattern: /(buy|purchase|order) (now|today|immediately)/i, tactic: 'hard_sell' },
      { pattern: /special (offer|discount|deal) (for you|today only)/i, tactic: 'fomo' },
      { pattern: /\d+% (off|discount) if you (buy|act) now/i, tactic: 'pressure_discount' },
      { pattern: /don't miss (out|this)/i, tactic: 'fomo' },
      { pattern: /only \d+ (left|remaining|available)/i, tactic: 'false_scarcity' },
      { pattern: /limited time (offer|deal)/i, tactic: 'artificial_urgency' },
      { pattern: /this (offer|deal) expires (soon|today)/i, tactic: 'artificial_urgency' }
    ];
    
    for (const { pattern, tactic } of salesPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'sales_manipulation',
          severity: 'high',
          confidence: 0.85,
          description: 'Detected aggressive sales tactics',
          tactics: [tactic],
          evidence: text.match(pattern)?.[0] || ''
        });
        break; // Only add once per category
      }
    }
    
    // Emotional manipulation patterns
    const emotionalPatterns = [
      { pattern: /you (should|must|need to) feel (guilty|ashamed|bad)/i, tactic: 'guilt_tripping' },
      { pattern: /(everyone|nobody) (thinks|believes) (you|this)/i, tactic: 'social_pressure' },
      { pattern: /if you (loved|cared about) me/i, tactic: 'emotional_blackmail' },
      { pattern: /you('re| are) (crazy|paranoid|overreacting)/i, tactic: 'gaslighting' },
      { pattern: /you (owe|should do this for) me/i, tactic: 'obligation' }
    ];
    
    for (const { pattern, tactic } of emotionalPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'manipulation',
          severity: 'high',
          confidence: 0.8,
          description: 'Detected emotional manipulation',
          tactics: [tactic],
          evidence: text.match(pattern)?.[0] || ''
        });
        break;
      }
    }
    
    // Fear mongering patterns
    if (/if you don't (do|buy|act) (now|immediately)/i.test(text) ||
        /you (will|might) (lose|miss|regret)/i.test(text) ||
        /(danger|threat|risk) if you don't/i.test(text) ||
        /time is running out/i.test(text)) {
      violations.push({
        category: 'manipulation',
        severity: 'high',
        confidence: 0.75,
        description: 'Detected fear-based manipulation',
        tactics: ['fear_mongering', 'artificial_urgency']
      });
    }
    
    // Phishing patterns
    if (/your account (has been|will be) (suspended|locked|closed)/i.test(text) ||
        /verify your (account|identity|information)/i.test(text) ||
        /unusual (activity|login) detected/i.test(text) ||
        /click (here|this link|below) (immediately|now)/i.test(text)) {
      violations.push({
        category: 'phishing',
        severity: 'critical',
        confidence: 0.9,
        description: 'Potential phishing attempt detected',
        recommendation: 'Never click links or provide credentials based on unsolicited messages'
      });
    }
    
    // Scam patterns
    if (/make \$\d+,?\d* (per day|per week) (from home|online)/i.test(text) ||
        /guaranteed (profit|return|income)/i.test(text) ||
        /pay \$?\d+ (upfront|first|now) to (receive|get|unlock)/i.test(text)) {
      violations.push({
        category: 'scam',
        severity: 'critical',
        confidence: 0.85,
        description: 'Potential scam detected',
        recommendation: 'Be extremely cautious of get-rich-quick schemes'
      });
    }
    
    // Dangerous content patterns
    if (/how to (make|create|build) (bomb|explosive|weapon)/i.test(text) ||
        /how to (hack|steal|break into)/i.test(text) ||
        /suicide (method|instructions)/i.test(text)) {
      violations.push({
        category: 'dangerous_content',
        severity: 'critical',
        confidence: 0.95,
        description: 'Detected dangerous or harmful content',
        recommendation: 'Report this content immediately'
      });
    }
    
    const is_safe = violations.length === 0;
    const safety_score = is_safe ? 1.0 : Math.max(0.1, 1.0 - (violations.length * 0.2));
    
    return {
      is_safe,
      safety_score,
      violations,
      source: 'local_regex',
      analyzer: 'Local Pattern Matching',
      overall_assessment: is_safe ? 'No safety concerns detected' : `${violations.length} potential issue(s) found`
    };
  }
  
  showLoadingIndicator(element) {
    const existing = element.querySelector('.anansi-indicator');
    if (existing) existing.remove();
    
    const loading = document.createElement('div');
    loading.className = 'anansi-indicator anansi-loading';
    loading.innerHTML = '⏳ Analyzing...';
    loading.style.cssText = `
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      padding: 4px 10px !important;
      border-radius: 12px !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      margin-left: 8px !important;
      background: #f3f4f6 !important;
      color: #6b7280 !important;
      border: 1px solid #d1d5db !important;
    `;
    
    element.appendChild(loading);
  }
  
  displaySafetyResult(element, result) {
    const existing = element.querySelector('.anansi-indicator');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.className = 'anansi-indicator';
    indicator.style.cssText = `
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      padding: 4px 12px !important;
      border-radius: 16px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      margin-left: 8px !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      z-index: 10000 !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    `;
    
    if (result.is_safe) {
      indicator.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      indicator.style.color = 'white';
      indicator.innerHTML = `✓ בטוח${result.analyzer ? ` (${result.analyzer})` : ''}`;
    } else {
      indicator.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      indicator.style.color = 'white';
      indicator.innerHTML = `⚠ אזהרה (${result.violations.length})`;
      this.stats.warningsIssued++;
    }
    
    const scorePercent = (result.safety_score * 100).toFixed(0);
    indicator.title = `Safety Score: ${scorePercent}%\nAnalyzer: ${result.analyzer || 'Local'}\nClick for details`;
    
    indicator.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showDetailedReport(result);
    });
    
    indicator.addEventListener('mouseenter', () => {
      indicator.style.transform = 'scale(1.05)';
    });
    
    indicator.addEventListener('mouseleave', () => {
      indicator.style.transform = 'scale(1)';
    });
    
    element.appendChild(indicator);
  }
  
  handleUnsafeContent(element, result) {
    if (!this.settings.showWarnings) return;
    
    const existing = element.previousElementSibling;
    if (existing?.classList.contains('anansi-warning')) return;
    
    const warning = document.createElement('div');
    warning.className = 'anansi-warning';
    warning.style.cssText = `
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
      border: 2px solid #ef4444 !important;
      border-radius: 12px !important;
      padding: 16px !important;
      margin: 12px 0 !important;
      font-size: 14px !important;
      color: #991b1b !important;
      cursor: pointer !important;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2) !important;
      animation: slideDown 0.4s ease-out !important;
    `;
    
    const categories = [...new Set(result.violations.map(v => v.category))];
    const highestSeverity = result.violations.reduce((max, v) => {
      const severities = { low: 1, medium: 2, high: 3, critical: 4 };
      return severities[v.severity] > severities[max] ? v.severity : max;
    }, 'low');
    
    warning.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 20px;">🛡️</span>
        <strong style="font-size: 16px;">אזהרת בטיחות</strong>
        <span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">${highestSeverity.toUpperCase()}</span>
      </div>
      <div style="margin-bottom: 8px;">זוהו ${result.violations.length} בעיות אפשריות</div>
      <div style="font-size: 12px; opacity: 0.9;">קטגוריות: ${categories.join(', ')}</div>
      <div style="margin-top: 8px; font-size: 11px; opacity: 0.8;">לחץ לפרטים מלאים • ${result.analyzer || 'Local Analysis'}</div>
    `;
    
    warning.addEventListener('click', () => {
      this.showDetailedReport(result);
    });
    
    element.parentNode.insertBefore(warning, element);
    
    if (this.settings.blockUnsafe) {
      element.style.filter = 'blur(5px)';
      element.style.cursor = 'pointer';
      element.title = 'Click to reveal content';
      element.addEventListener('click', () => {
        element.style.filter = 'none';
      }, { once: true });
    }
  }
  
  showDetailedReport(result) {
    // Remove existing modal if present
    const existingModal = document.querySelector('.anansi-modal-overlay');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'anansi-modal-overlay';
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.85) !important;
      backdrop-filter: blur(4px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 999999 !important;
      animation: fadeIn 0.3s ease-out !important;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white !important;
      border-radius: 16px !important;
      padding: 0 !important;
      max-width: 700px !important;
      width: 90% !important;
      max-height: 85vh !important;
      overflow: hidden !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4) !important;
      animation: slideUp 0.4s ease-out !important;
      display: flex !important;
      flex-direction: column !important;
    `;
    
    const scoreColor = result.is_safe ? '#10b981' : (result.safety_score > 0.5 ? '#f59e0b' : '#ef4444');
    const statusEmoji = result.is_safe ? '✅' : (result.safety_score > 0.5 ? '⚠️' : '🚨');
    
    content.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 16px 16px 0 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px;">
            🕷️ Anansi Safety Report
          </h2>
          <button id="anansi-close" style="
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
        </div>
        <div style="margin-top: 8px; font-size: 13px; opacity: 0.9;">
          Analyzed by: ${result.analyzer || 'Local Regex Engine'}
        </div>
      </div>
      
      <div style="padding: 24px; overflow-y: auto; flex: 1;">
        <!-- Safety Score -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 72px; font-weight: bold; color: ${scoreColor}; line-height: 1;">
            ${statusEmoji}
          </div>
          <div style="font-size: 48px; font-weight: bold; color: ${scoreColor}; margin: 8px 0;">
            ${(result.safety_score * 100).toFixed(0)}%
          </div>
          <div style="color: #6b7280; font-size: 16px;">Safety Score</div>
          ${result.overall_assessment ? `
            <div style="margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; color: #374151; font-size: 14px;">
              ${result.overall_assessment}
            </div>
          ` : ''}
        </div>
        
        <!-- Violations -->
        ${result.violations && result.violations.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #111827; margin-bottom: 16px; font-size: 20px;">⚠️ Issues Detected (${result.violations.length})</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${result.violations.map((v, i) => `
                <div style="background: ${v.severity === 'critical' ? '#fef2f2' : '#fef3c7'}; border-left: 4px solid ${v.severity === 'critical' ? '#ef4444' : '#f59e0b'}; border-radius: 8px; padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                      <strong style="color: #991b1b; text-transform: capitalize; font-size: 15px;">
                        ${v.category.replace(/_/g, ' ')}
                      </strong>
                      <span style="background: ${v.severity === 'critical' ? '#dc2626' : v.severity === 'high' ? '#ea580c' : '#f59e0b'}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 8px;">
                        ${v.severity.toUpperCase()}
                      </span>
                    </div>
                    <div style="background: rgba(0,0,0,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${(v.confidence * 100).toFixed(0)}% confident
                    </div>
                  </div>
                  
                  ${v.description ? `
                    <div style="color: #7f1d1d; font-size: 14px; margin-bottom: 8px;">
                      ${v.description}
                    </div>
                  ` : ''}
                  
                  ${v.evidence ? `
                    <div style="background: rgba(0,0,0,0.05); padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #991b1b; margin-bottom: 8px; word-break: break-word;">
                      "${v.evidence}"
                    </div>
                  ` : ''}
                  
                  ${v.tactics && v.tactics.length > 0 ? `
                    <div style="margin-top: 10px;">
                      <strong style="font-size: 12px; color: #7f1d1d;">Tactics used:</strong>
                      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
                        ${v.tactics.map(t => `
                          <span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                            ${t.replace(/_/g, ' ')}
                          </span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                  
                  ${v.recommendation ? `
                    <div style="margin-top: 10px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; color: #1e40af; font-size: 13px;">
                      💡 <strong>Recommendation:</strong> ${v.recommendation}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div style="text-align: center; padding: 32px; background: #f0fdf4; border-radius: 12px; border: 2px solid #10b981;">
            <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
            <div style="font-size: 18px; font-weight: 600; color: #065f46; margin-bottom: 8px;">
              No Safety Concerns Detected
            </div>
            <div style="color: #047857; font-size: 14px;">
              This content appears to be safe and free from manipulation tactics.
            </div>
          </div>
        `}
        
        <!-- Red Flags -->
        ${result.red_flags && result.red_flags.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #dc2626; margin-bottom: 10px;">🚩 Red Flags</h4>
            <ul style="color: #991b1b; font-size: 13px; line-height: 1.8;">
              ${result.red_flags.map(flag => `<li>${flag}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <!-- Safe Aspects -->
        ${result.safe_aspects && result.safe_aspects.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #059669; margin-bottom: 10px;">✅ Safe Aspects</h4>
            <ul style="color: #047857; font-size: 13px; line-height: 1.8;">
              ${result.safe_aspects.map(aspect => `<li>${aspect}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <!-- Footer Info -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
          Analysis Method: ${result.source === 'local_regex' ? 'Local Pattern Matching' : 'AI-Powered Analysis'}
          ${result.analyzer ? ` • Model: ${result.analyzer}` : ''}
        </div>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close handlers
    const closeBtn = modal.querySelector('#anansi-close');
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
  
  injectGlobalIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'anansi-global-indicator';
    indicator.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      padding: 14px 18px !important;
      border-radius: 50px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4) !important;
      z-index: 99999 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
    `;
    
    indicator.innerHTML = `
      <span style="font-size: 20px;">🕷️</span>
      <div>
        <div style="font-size: 12px; line-height: 1.3;">Anansi Watchdog</div>
        <div id="anansi-status" style="font-size: 10px; opacity: 0.9;">Monitoring...</div>
      </div>
    `;
    
    indicator.addEventListener('click', () => {
      this.showGlobalStats();
    });
    
    indicator.addEventListener('mouseenter', () => {
      indicator.style.transform = 'scale(1.05) translateY(-2px)';
      indicator.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
    });
    
    indicator.addEventListener('mouseleave', () => {
      indicator.style.transform = 'scale(1) translateY(0)';
      indicator.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
    });
    
    document.body.appendChild(indicator);
  }
  
  updateGlobalIndicator() {
    const indicator = document.getElementById('anansi-global-indicator');
    if (!indicator) return;
    
    const status = indicator.querySelector('#anansi-status');
    if (!status) return;
    
    if (this.stats.violationsFound > 0) {
      indicator.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      status.textContent = `${this.stats.violationsFound} warnings`;
    } else {
      indicator.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      status.textContent = 'All safe ✓';
    }
  }
  
  showGlobalStats() {
    const apiStatus = this.aiAnalyzer.hasAPIKey() ? '✅ Enabled' : '❌ Disabled';
    const cacheHitRate = this.stats.apiCalls > 0 
      ? ((this.stats.cacheHits / (this.stats.apiCalls + this.stats.cacheHits)) * 100).toFixed(0) 
      : '0';
    
    alert(
      `📊 Anansi Watchdog V2 Statistics\n\n` +
      `Platform: ${this.platform}\n` +
      `Messages Scanned: ${this.stats.messagesScanned}\n` +
      `Violations Found: ${this.stats.violationsFound}\n` +
      `Warnings Issued: ${this.stats.warningsIssued}\n\n` +
      `🤖 AI Analysis: ${apiStatus}\n` +
      `API Calls Made: ${this.stats.apiCalls}\n` +
      `Cache Hit Rate: ${cacheHitRate}%\n\n` +
      `⚙️ Click extension icon for settings`
    );
  }
  
  async updateStats() {
    chrome.runtime.sendMessage({
      type: 'UPDATE_STATS',
      messagesScanned: 1,
      violationsFound: this.stats.violationsFound > 0 ? 1 : 0,
      warningsIssued: this.stats.warningsIssued > 0 ? 1 : 0
    });
    
    // Update badge
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: this.stats.violationsFound
    });
  }
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.anansiWatchdog = new AnansiWatchdogV2();
  });
} else {
  window.anansiWatchdog = new AnansiWatchdogV2();
}
