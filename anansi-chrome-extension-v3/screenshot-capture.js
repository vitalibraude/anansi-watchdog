/**
 * Anansi Watchdog - Screenshot Capture Module
 * Captures screenshots of AI conversations for visual analysis
 */

class ScreenshotCapture {
  constructor() {
    this.screenshotQueue = [];
    this.isCapturing = false;
  }

  /**
   * Capture screenshot of a specific element (AI message)
   */
  async captureElement(element) {
    try {
      // Method 1: Use html2canvas library (need to inject it)
      if (typeof html2canvas !== 'undefined') {
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          logging: false,
          scale: 2 // High quality
        });
        return canvas.toDataURL('image/png');
      }
      
      // Method 2: Use native Chrome API (via background script)
      return await this.captureViaAPI(element);
      
    } catch (error) {
      console.error('🕷️ Screenshot capture failed:', error);
      return null;
    }
  }

  /**
   * Capture screenshot via Chrome tabs API
   */
  async captureViaAPI(element) {
    return new Promise((resolve, reject) => {
      // Get element position
      const rect = element.getBoundingClientRect();
      
      // Send message to background script to capture
      chrome.runtime.sendMessage({
        type: 'CAPTURE_SCREENSHOT',
        area: {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height
        }
      }, (response) => {
        if (response && response.dataUrl) {
          resolve(response.dataUrl);
        } else {
          reject(new Error('Screenshot capture failed'));
        }
      });
    });
  }

  /**
   * Capture full page screenshot
   */
  async captureFullPage() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'CAPTURE_FULL_PAGE'
      }, (response) => {
        if (response && response.dataUrl) {
          resolve(response.dataUrl);
        } else {
          reject(new Error('Full page screenshot failed'));
        }
      });
    });
  }

  /**
   * Capture screenshot of conversation area
   */
  async captureConversation(platform) {
    const selectors = {
      chatgpt: '.main, #__next',
      gemini: '.conversation-container, main',
      claude: '.chat-container, main'
    };

    const selector = selectors[platform];
    if (!selector) {
      console.error('Unknown platform:', platform);
      return null;
    }

    const conversationElement = document.querySelector(selector);
    if (!conversationElement) {
      console.error('Conversation element not found');
      return null;
    }

    return await this.captureElement(conversationElement);
  }

  /**
   * Auto-capture when new AI message appears
   */
  async autoCapture(element, platform) {
    if (this.isCapturing) {
      this.screenshotQueue.push({ element, platform });
      return null;
    }

    this.isCapturing = true;

    try {
      // Wait for animations to complete
      await this.waitForAnimations(element);

      // Capture the screenshot
      const dataUrl = await this.captureElement(element);

      // Process queue
      if (this.screenshotQueue.length > 0) {
        const next = this.screenshotQueue.shift();
        setTimeout(() => {
          this.autoCapture(next.element, next.platform);
        }, 500);
      }

      this.isCapturing = false;
      return dataUrl;

    } catch (error) {
      console.error('Auto-capture failed:', error);
      this.isCapturing = false;
      return null;
    }
  }

  /**
   * Wait for CSS animations/transitions to complete
   */
  waitForAnimations(element, timeout = 1000) {
    return new Promise((resolve) => {
      let timeoutId = setTimeout(() => resolve(), timeout);

      const onTransitionEnd = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      element.addEventListener('transitionend', onTransitionEnd, { once: true });
      element.addEventListener('animationend', onTransitionEnd, { once: true });
    });
  }

  /**
   * Inject html2canvas library if not already present
   */
  async injectHtml2Canvas() {
    if (typeof html2canvas !== 'undefined') {
      return true;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load html2canvas'));
      document.head.appendChild(script);
    });
  }

  /**
   * Crop screenshot to specific message
   */
  async cropToMessage(dataUrl, element) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const rect = element.getBoundingClientRect();
        canvas.width = rect.width * 2; // Retina
        canvas.height = rect.height * 2;
        
        ctx.drawImage(
          img,
          rect.left * 2,
          rect.top * 2,
          rect.width * 2,
          rect.height * 2,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  }

  /**
   * Save screenshot to downloads (optional)
   */
  async saveScreenshot(dataUrl, filename = 'anansi-screenshot.png') {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  /**
   * Convert screenshot to text using OCR (fallback if text extraction fails)
   */
  async extractTextFromScreenshot(dataUrl) {
    // This would use Tesseract.js or Gemini Vision API
    // For now, return null to indicate OCR not implemented
    console.log('🕷️ OCR extraction not yet implemented');
    return null;
  }
}

// Export for use in content script
window.ScreenshotCapture = ScreenshotCapture;
