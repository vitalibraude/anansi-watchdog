/**
 * Anansi Watchdog V3 - Content Script
 * Hybrid Detection: 300+ Built-in Patterns + Optional AI Analysis
 */

class AnansiWatchdogV3 {
  constructor() {
    this.isEnabled = true;
    this.detectionMode = 'no-ai'; // 'no-ai' or 'ai'
    this.stats = {
      messagesScanned: 0,
      violationsFound: 0,
      warningsIssued: 0,
      apiCalls: 0,
      cacheHits: 0
    };
    
    // Initialize detection engines
    this.advancedPatterns = new AdvancedPatternLibrary();
    this.aiAnalyzer = new AIAnalyzer();
    this.screenshotCapture = new ScreenshotCapture();
    
    this.init();
  }
  
  async init() {
    console.log('🕷️ Anansi Watchdog V3 initialized (Hybrid Mode)');
    await this.loadSettings();
    this.platform = this.detectPlatform();
    console.log(`Platform: ${this.platform}`);
    console.log(`Detection Mode: ${this.detectionMode}`);
    
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
      detectionMode: 'no-ai', // NEW: 'no-ai' or 'ai'
      useScreenshots: false,
      enabledPlatforms: {
        chatgpt: true,
        gemini: true,
        claude: true
      }
    });
    
    this.settings = settings;
    this.isEnabled = settings.enabled && settings.enabledPlatforms[this.platform];
    this.detectionMode = settings.detectionMode || 'no-ai';
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
      if (!text || text.length < 20) continue;
      
      message.dataset.anansiScanned = 'true';
      this.stats.messagesScanned++;
      
      // Show loading indicator
      this.showLoadingIndicator(message);
      
      try {
        const result = await this.checkSafety(text, message);
        
        this.displaySafetyResult(message, result);
        
        if (!result.is_safe) {
          this.stats.violationsFound++;
          this.handleUnsafeContent(message, result);
        }
        
        this.updateGlobalIndicator();
        this.updateStats();
        
      } catch (error) {
        console.error('🕷️ Analysis error:', error);
        const fallbackResult = await this.advancedPatterns.analyze(text);
        this.displaySafetyResult(message, fallbackResult);
      }
    }
  }
  
  async checkSafety(text, element) {
    // Mode 1: No-AI (Built-in 300+ Patterns) - DEFAULT & RECOMMENDED
    if (this.detectionMode === 'no-ai') {
      console.log('🚀 Using built-in pattern library (300+ rules)');
      return await this.advancedPatterns.analyze(text);
    }
    
    // Mode 2: AI Analysis (requires API keys)
    if (this.detectionMode === 'ai') {
      if (this.aiAnalyzer.hasAPIKey()) {
        try {
          console.log('🤖 Using AI analysis...');
          const result = await this.aiAnalyzer.analyzeMessage(text, this.platform);
          this.stats.apiCalls++;
          return result;
        } catch (error) {
          console.warn('🕷️ AI analysis failed, falling back to patterns:', error);
        }
      } else {
        console.warn('🕷️ AI mode selected but no API key configured, falling back to patterns');
      }
    }
    
    // Fallback: Always use pattern library
    return await this.advancedPatterns.analyze(text);
  }
  
  showLoadingIndicator(element) {
    const existing = element.querySelector('.anansi-indicator');
    if (existing) existing.remove();
    
    const loading = document.createElement('div');
    loading.className = 'anansi-indicator anansi-loading';
    loading.innerHTML = '⏳ מנתח...';
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
      indicator.innerHTML = `✓ בטוח`;
    } else {
      indicator.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      indicator.style.color = 'white';
      indicator.innerHTML = `⚠ ${result.violations.length} בעיות`;
      this.stats.warningsIssued++;
    }
    
    // Add analyzer badge
    const analyzerBadge = this.detectionMode === 'no-ai' ? '🚀 מובנה' : '🤖 AI';
    indicator.innerHTML += ` <span style="font-size:10px; opacity:0.8">${analyzerBadge}</span>`;
    
    const scorePercent = (result.safety_score * 100).toFixed(0);
    indicator.title = `Safety Score: ${scorePercent}%\nAnalyzer: ${result.analyzer || 'Built-in Patterns'}\nClick for details`;
    
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
    
    // Get pattern library stats if available
    const patternStats = result.stats || {};
    const statsText = Object.keys(patternStats).length > 0
      ? `<div style="font-size: 11px; margin-top: 8px; opacity: 0.8;">
          🤬 קללות: ${patternStats.profanityCount || 0} | 
          🎭 מניפולציה: ${patternStats.manipulationCount || 0} | 
          📰 מטעים: ${patternStats.misleadingCount || 0}
        </div>`
      : '';
    
    warning.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 20px;">🛡️</span>
        <strong style="font-size: 16px;">אזהרת בטיחות</strong>
        <span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">${highestSeverity.toUpperCase()}</span>
      </div>
      <div style="margin-bottom: 8px;">זוהו ${result.violations.length} בעיות אפשריות</div>
      <div style="font-size: 12px; opacity: 0.9;">קטגוריות: ${categories.join(', ')}</div>
      ${statsText}
      <div style="margin-top: 8px; font-size: 11px; opacity: 0.8;">
        לחץ לפרטים מלאים • ${result.analyzer || 'Built-in Analysis'}
      </div>
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
    
    // Show pattern stats if available
    const patternStats = result.stats || {};
    const statsSection = Object.keys(patternStats).length > 0
      ? `
        <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 12px;">
          <h4 style="color: #111827; margin-bottom: 12px; font-size: 15px;">📊 סטטיסטיקות זיהוי</h4>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px;">
            <div>🤬 קללות: <strong>${patternStats.profanityCount || 0}</strong></div>
            <div>🎭 מניפולציה: <strong>${patternStats.manipulationCount || 0}</strong></div>
            <div>📰 מטעים: <strong>${patternStats.misleadingCount || 0}</strong></div>
            <div>💰 הונאות: <strong>${patternStats.scamCount || 0}</strong></div>
            <div>⚠️ מסוכן: <strong>${patternStats.dangerousCount || 0}</strong></div>
            <div>🔍 סה"כ: <strong>${Object.values(patternStats).reduce((a,b) => a+b, 0)}</strong></div>
          </div>
        </div>
      `
      : '';
    
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
          ">×</button>
        </div>
        <div style="margin-top: 8px; font-size: 13px; opacity: 0.9;">
          מנתח: ${result.analyzer || 'Advanced Pattern Library'}
        </div>
      </div>
      
      <div style="padding: 24px; overflow-y: auto; flex: 1;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 72px; font-weight: bold; color: ${scoreColor}; line-height: 1;">
            ${statusEmoji}
          </div>
          <div style="font-size: 48px; font-weight: bold; color: ${scoreColor}; margin: 8px 0;">
            ${(result.safety_score * 100).toFixed(0)}%
          </div>
          <div style="color: #6b7280; font-size: 16px;">ציון בטיחות</div>
          ${result.overall_assessment ? `
            <div style="margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; color: #374151; font-size: 14px;">
              ${result.overall_assessment}
            </div>
          ` : ''}
        </div>
        
        ${result.violations && result.violations.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #111827; margin-bottom: 16px; font-size: 20px;">⚠️ בעיות שזוהו (${result.violations.length})</h3>
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
                      ${(v.confidence * 100).toFixed(0)}% בטוח
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
                      <strong style="font-size: 12px; color: #7f1d1d;">טקטיקות:</strong>
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
                      💡 <strong>המלצה:</strong> ${v.recommendation}
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
              לא זוהו בעיות בטיחות
            </div>
            <div style="color: #047857; font-size: 14px;">
              התוכן נראה בטוח וללא טקטיקות מניפולציה
            </div>
          </div>
        `}
        
        ${statsSection}
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
          שיטת ניתוח: ${result.source === 'advanced_patterns' ? 'ספריית דפוסים מתקדמת (300+ כללים)' : 'ניתוח מבוסס AI'}
          ${result.analyzer ? ` • מנתח: ${result.analyzer}` : ''}
        </div>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close handlers
    const closeBtn = modal.querySelector('#anansi-close');
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
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
    
    const modeBadge = this.detectionMode === 'no-ai' ? '🚀' : '🤖';
    
    indicator.innerHTML = `
      <span style="font-size: 20px;">${modeBadge}</span>
      <div>
        <div style="font-size: 12px; line-height: 1.3;">Anansi V3</div>
        <div id="anansi-status" style="font-size: 10px; opacity: 0.9;">מנטר...</div>
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
      status.textContent = `${this.stats.violationsFound} אזהרות`;
    } else {
      indicator.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      status.textContent = 'הכל בטוח ✓';
    }
  }
  
  showGlobalStats() {
    const patternStats = this.advancedPatterns.getStatsReport();
    const modeText = this.detectionMode === 'no-ai' ? '🚀 בדיקה ללא AI' : '🤖 ניתוח AI מלא';
    
    alert(
      `📊 Anansi Watchdog V3 Statistics\n\n` +
      `Platform: ${this.platform}\n` +
      `Detection Mode: ${modeText}\n\n` +
      `Messages Scanned: ${this.stats.messagesScanned}\n` +
      `Violations Found: ${this.stats.violationsFound}\n` +
      `Warnings Issued: ${this.stats.warningsIssued}\n\n` +
      `🔍 Pattern Library Stats:\n` +
      `Total Detections: ${patternStats.total_detections}\n` +
      `🤬 Profanity: ${patternStats.breakdown.profanityCount}\n` +
      `🎭 Manipulation: ${patternStats.breakdown.manipulationCount}\n` +
      `📰 Misleading: ${patternStats.breakdown.misleadingCount}\n` +
      `💰 Scams: ${patternStats.breakdown.scamCount}\n` +
      `⚠️ Dangerous: ${patternStats.breakdown.dangerousCount}\n\n` +
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
    
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: this.stats.violationsFound
    });
  }
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.anansiWatchdog = new AnansiWatchdogV3();
  });
} else {
  window.anansiWatchdog = new AnansiWatchdogV3();
}
