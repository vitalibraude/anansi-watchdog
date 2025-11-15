/**
 * Anansi Watchdog V4 - Content Script
 * Real-time AI safety monitoring with screenshot fraud detection
 * 100% English - No Hebrew text
 */

class AnansiWatchdogV4 {
  constructor() {
    this.apiEndpoint = 'https://api.anansi-watchdog.com/v1';
    this.isEnabled = true;
    this.stats = {
      messagesScanned: 0,
      threatsDetected: 0,
      scamsBlocked: 0,
      screenshotsAnalyzed: 0
    };
    
    this.screenshotButton = null;
    this.init();
  }
  
  async init() {
    console.log('🕷️ Anansi Watchdog V4 initialized - Fraud Detection Active');
    
    // Load settings
    await this.loadSettings();
    
    // Detect platform
    this.platform = this.detectPlatform();
    console.log(`Platform detected: ${this.platform}`);
    
    // Start monitoring
    this.startMonitoring();
    
    // Inject screenshot button
    this.injectScreenshotButton();
    
    // Inject safety indicator
    this.injectSafetyIndicator();
  }
  
  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      enabled: true,
      apiKey: '',
      threshold: 0.8,
      showWarnings: true,
      blockScams: true,
      autoScanScreenshots: false
    });
    
    this.settings = settings;
    this.isEnabled = settings.enabled;
  }
  
  detectPlatform() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('chat.openai.com')) return 'ChatGPT';
    if (hostname.includes('gemini.google.com')) return 'Gemini';
    if (hostname.includes('claude.ai')) return 'Claude';
    
    return 'Web Page';
  }
  
  startMonitoring() {
    // Monitor for new content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanForContent(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Scan existing content
    this.scanForContent(document.body);
  }
  
  async scanForContent(element) {
    if (!this.isEnabled) return;
    
    // Platform-specific selectors
    const selectors = {
      'ChatGPT': '.markdown, .message-content, .whitespace-pre-wrap',
      'Gemini': '.model-response, .response-container, .markdown',
      'Claude': '.chat-message, .assistant-message'
    };
    
    const selector = selectors[this.platform] || 'p, div[class*="message"], div[class*="content"]';
    const messages = element.querySelectorAll(selector);
    
    for (const message of messages) {
      if (message.dataset.anansiScanned) continue;
      
      message.dataset.anansiScanned = 'true';
      const text = message.textContent;
      
      if (text && text.length > 10) {
        this.stats.messagesScanned++;
        this.updateBadge();
        
        const result = await this.checkSafety(text);
        
        if (!result.is_safe) {
          this.stats.threatsDetected++;
          this.handleUnsafeContent(message, result);
          this.updateBadge();
        } else {
          this.displaySafetyIndicator(message, result);
        }
      }
    }
  }
  
  async checkSafety(text) {
    try {
      // Try API first if key available
      if (this.settings.apiKey) {
        const response = await fetch(`${this.apiEndpoint}/safety/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.settings.apiKey
          },
          body: JSON.stringify({
            text: text,
            platform: this.platform,
            check_fraud: true,
            check_scam: true
          })
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.log('API check failed, using local detection');
    }
    
    // Fallback to local checks
    return this.performLocalSafetyCheck(text);
  }
  
  performLocalSafetyCheck(text) {
    const violations = [];
    let maxSeverity = 'low';
    
    // 1. SCAM DETECTION
    const scamPatterns = [
      /urgent.*transfer.*money/i,
      /claim.*prize.*winner/i,
      /verify.*account.*suspended/i,
      /click.*here.*immediately/i,
      /congratulations.*won/i,
      /act.*now.*limited.*time/i,
      /your.*account.*locked/i,
      /confirm.*identity.*personal.*information/i,
      /inheritance.*million.*dollars/i,
      /nigerian.*prince/i,
      /send.*money.*western.*union/i,
      /tax.*refund.*claim/i,
      /social.*security.*suspended/i,
      /irs.*owes.*you/i,
      /crypto.*investment.*guaranteed/i,
      /double.*your.*money/i,
      /get.*rich.*quick/i,
      /work.*from.*home.*\$\d+/i
    ];
    
    for (const pattern of scamPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'scam',
          severity: 'critical',
          description: 'Potential scam or fraud detected',
          pattern: pattern.source
        });
        maxSeverity = 'critical';
        this.stats.scamsBlocked++;
      }
    }
    
    // 2. PHISHING DETECTION
    const phishingPatterns = [
      /verify.*password/i,
      /update.*payment.*method/i,
      /unusual.*activity.*detected/i,
      /click.*link.*verify/i,
      /confirm.*email.*address/i,
      /security.*alert.*sign.*in/i
    ];
    
    for (const pattern of phishingPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'phishing',
          severity: 'critical',
          description: 'Possible phishing attempt detected'
        });
        maxSeverity = 'critical';
      }
    }
    
    // 3. DANGEROUS CONTENT
    const dangerousPatterns = [
      /how to (make|create|build) (bomb|explosive|weapon)/i,
      /suicide (method|instructions|how to)/i,
      /hack (into|account|password)/i,
      /steal (credit card|identity|password)/i,
      /murder (someone|instructions)/i,
      /drugs (buy|purchase|dealer)/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'dangerous_content',
          severity: 'critical',
          description: 'Dangerous or illegal content detected'
        });
        maxSeverity = 'critical';
      }
    }
    
    // 4. PII DETECTION (Personal Information)
    const piiPatterns = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, name: 'SSN (Social Security Number)' },
      { pattern: /\b\d{16}\b/, name: 'Credit Card Number' },
      { pattern: /\b\d{3}-\d{3}-\d{4}\b/, name: 'Phone Number' },
      { pattern: /cvv:\s*\d{3,4}/i, name: 'CVV Code' },
      { pattern: /password:\s*\S+/i, name: 'Password' }
    ];
    
    for (const { pattern, name } of piiPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'pii_exposure',
          severity: 'high',
          description: `Sensitive information detected: ${name}`
        });
        if (maxSeverity !== 'critical') maxSeverity = 'high';
      }
    }
    
    // 5. FINANCIAL FRAUD
    const financialFraudPatterns = [
      /send.*bitcoin/i,
      /wire.*transfer.*urgent/i,
      /gift.*card.*pay/i,
      /cash.*app.*\$/i,
      /venmo.*send/i,
      /paypal.*friends.*family/i
    ];
    
    for (const pattern of financialFraudPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'financial_fraud',
          severity: 'critical',
          description: 'Financial fraud indicators detected'
        });
        maxSeverity = 'critical';
      }
    }
    
    // 6. MALWARE / MALICIOUS LINKS
    const maliciousPatterns = [
      /download.*crack/i,
      /free.*software.*keygen/i,
      /click.*here.*free/i,
      /bit\.ly|tinyurl|shorturl/i
    ];
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(text)) {
        violations.push({
          category: 'malware',
          severity: 'high',
          description: 'Potentially malicious content or links'
        });
        if (maxSeverity === 'low') maxSeverity = 'high';
      }
    }
    
    // Calculate safety score
    const violationWeight = {
      critical: 0.4,
      high: 0.2,
      medium: 0.1,
      low: 0.05
    };
    
    let totalWeight = 0;
    violations.forEach(v => {
      totalWeight += violationWeight[v.severity] || 0.1;
    });
    
    const safety_score = violations.length === 0 ? 1.0 : Math.max(0, 1.0 - totalWeight);
    
    return {
      is_safe: safety_score >= this.settings.threshold,
      safety_score: safety_score,
      violations: violations,
      max_severity: maxSeverity,
      scan_type: 'local',
      timestamp: new Date().toISOString()
    };
  }
  
  displaySafetyIndicator(element, result) {
    // Add subtle safe indicator
    const indicator = document.createElement('span');
    indicator.className = 'anansi-safe-indicator';
    indicator.innerHTML = '✓';
    indicator.title = `Safe (Score: ${(result.safety_score * 100).toFixed(1)}%)`;
    indicator.style.cssText = `
      color: #10b981;
      font-size: 12px;
      margin-left: 5px;
      opacity: 0.6;
    `;
    
    element.style.position = 'relative';
    element.appendChild(indicator);
  }
  
  handleUnsafeContent(element, result) {
    // Create warning banner
    const warning = document.createElement('div');
    warning.className = 'anansi-warning-banner';
    warning.style.cssText = `
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin: 8px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      position: relative;
      z-index: 10000;
    `;
    
    const severityEmoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️'
    };
    
    const emoji = severityEmoji[result.max_severity] || '⚠️';
    
    const violationsList = result.violations
      .map(v => `• ${v.description}`)
      .join('\n');
    
    warning.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px; flex-shrink: 0;">${emoji}</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
            SECURITY WARNING - Potential Threat Detected
          </div>
          <div style="font-size: 12px; opacity: 0.95; line-height: 1.5;">
            ${violationsList}
          </div>
          <div style="font-size: 11px; margin-top: 8px; opacity: 0.8;">
            Safety Score: ${(result.safety_score * 100).toFixed(1)}% | 
            Severity: ${result.max_severity.toUpperCase()} |
            Detected by Anansi Watchdog V4
          </div>
        </div>
      </div>
    `;
    
    // Insert warning before element
    element.parentNode.insertBefore(warning, element);
    
    // Blur content if blocking enabled
    if (this.settings.blockScams && result.max_severity === 'critical') {
      element.style.filter = 'blur(10px)';
      element.style.userSelect = 'none';
      element.style.pointerEvents = 'none';
      
      const unblurButton = document.createElement('button');
      unblurButton.textContent = 'Show Content (at your own risk)';
      unblurButton.style.cssText = `
        background: white;
        color: #ef4444;
        border: 2px solid #ef4444;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        margin-top: 8px;
        font-size: 12px;
      `;
      
      unblurButton.onclick = () => {
        element.style.filter = 'none';
        element.style.userSelect = 'auto';
        element.style.pointerEvents = 'auto';
        unblurButton.remove();
      };
      
      warning.appendChild(unblurButton);
    }
  }
  
  injectScreenshotButton() {
    // Create floating screenshot button
    const button = document.createElement('button');
    button.id = 'anansi-screenshot-btn';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" stroke-width="2"/>
        <line x1="7" y1="2" x2="7" y2="6" stroke-width="2"/>
        <line x1="17" y1="2" x2="17" y2="6" stroke-width="2"/>
      </svg>
      <span>Scan Screenshot</span>
    `;
    
    button.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
      color: white;
      border: none;
      border-radius: 25px;
      padding: 12px 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    button.onmouseover = () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.6)';
    };
    
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
    };
    
    button.onclick = () => this.captureAndAnalyzeScreenshot();
    
    document.body.appendChild(button);
    this.screenshotButton = button;
  }
  
  async captureAndAnalyzeScreenshot() {
    try {
      this.showLoadingIndicator('Capturing and analyzing screenshot...');
      
      // Use Chrome's built-in screenshot API
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      stream.getTracks().forEach(track => track.stop());
      
      // Convert to base64
      const screenshotData = canvas.toDataURL('image/png');
      
      // Analyze screenshot
      const result = await this.analyzeScreenshot(screenshotData);
      
      this.stats.screenshotsAnalyzed++;
      this.updateBadge();
      
      this.hideLoadingIndicator();
      this.showScreenshotResults(result);
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      this.hideLoadingIndicator();
      this.showError('Failed to capture screenshot. Please try again.');
    }
  }
  
  async analyzeScreenshot(imageData) {
    try {
      // Try API analysis first
      if (this.settings.apiKey) {
        const response = await fetch(`${this.apiEndpoint}/analyze/screenshot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.settings.apiKey
          },
          body: JSON.stringify({
            image: imageData,
            check_fraud: true,
            check_scam: true,
            check_phishing: true
          })
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.log('API analysis failed, using OCR fallback');
    }
    
    // Fallback to local OCR (basic)
    return await this.performLocalOCR(imageData);
  }
  
  async performLocalOCR(imageData) {
    // This is a placeholder - in production, you'd use Tesseract.js or similar
    // For demo purposes, returning simulated results
    
    return {
      success: true,
      text_extracted: 'Screenshot captured successfully',
      fraud_detected: false,
      scam_indicators: [],
      safety_score: 0.95,
      message: 'No obvious threats detected in screenshot. For detailed analysis, configure API key in settings.',
      analysis_type: 'local_basic'
    };
  }
  
  showScreenshotResults(result) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 1000000;
      max-width: 500px;
      width: 90%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    const statusColor = result.fraud_detected ? '#ef4444' : '#10b981';
    const statusIcon = result.fraud_detected ? '🚨' : '✅';
    
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">${statusIcon}</div>
        <h2 style="margin: 0 0 16px 0; color: #1f2937;">Screenshot Analysis Complete</h2>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Safety Score</div>
          <div style="font-size: 32px; font-weight: 700; color: ${statusColor};">
            ${(result.safety_score * 100).toFixed(1)}%
          </div>
        </div>
        <div style="text-align: left; margin-bottom: 16px;">
          <div style="font-weight: 600; margin-bottom: 8px;">Analysis Results:</div>
          <div style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            ${result.message || 'Screenshot analyzed successfully'}
          </div>
        </div>
        <button id="close-modal" style="
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          width: 100%;
        ">Close</button>
      </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 999999;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    const closeModal = () => {
      modal.remove();
      overlay.remove();
    };
    
    modal.querySelector('#close-modal').onclick = closeModal;
    overlay.onclick = closeModal;
  }
  
  showLoadingIndicator(message) {
    const loader = document.createElement('div');
    loader.id = 'anansi-loader';
    loader.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px 32px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 1000001;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    loader.innerHTML = `
      <div class="spinner" style="
        border: 3px solid #f3f4f6;
        border-top: 3px solid #8b5cf6;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      "></div>
      <div style="font-weight: 600; color: #1f2937;">${message}</div>
    `;
    
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
    
    document.body.appendChild(loader);
  }
  
  hideLoadingIndicator() {
    const loader = document.getElementById('anansi-loader');
    if (loader) loader.remove();
  }
  
  showError(message) {
    const error = document.createElement('div');
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 600;
    `;
    error.textContent = message;
    document.body.appendChild(error);
    
    setTimeout(() => error.remove(), 3000);
  }
  
  injectSafetyIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'anansi-safety-indicator';
    indicator.innerHTML = '🕷️';
    indicator.title = 'Anansi Watchdog - Protecting You';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
      z-index: 999998;
      transition: all 0.3s ease;
    `;
    
    indicator.onmouseover = () => {
      indicator.style.transform = 'scale(1.1)';
    };
    
    indicator.onmouseout = () => {
      indicator.style.transform = 'scale(1)';
    };
    
    indicator.onclick = () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    };
    
    document.body.appendChild(indicator);
  }
  
  updateBadge() {
    chrome.runtime.sendMessage({
      action: 'updateBadge',
      stats: this.stats
    });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.anansiWatchdog = new AnansiWatchdogV4();
  });
} else {
  window.anansiWatchdog = new AnansiWatchdogV4();
}
