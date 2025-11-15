/**
 * Anansi Watchdog - AI API Analyzer
 * Uses external AI APIs (Gemini, ChatGPT, Claude) to analyze conversations
 */

class AIAnalyzer {
  constructor() {
    this.cache = new Map(); // Cache to avoid duplicate API calls
    this.promptTemplate = this.buildPromptTemplate();
    this.loadAPIKeys();
  }

  async loadAPIKeys() {
    const storage = await chrome.storage.sync.get(['api_keys']);
    this.apiKeys = storage.api_keys || {
      gemini: '',
      openai: '',
      claude: ''
    };
  }

  /**
   * Master prompt for AI analysis
   * This prompt is sent to the analyzing AI (e.g., Gemini analyzing ChatGPT)
   */
  buildPromptTemplate() {
    return `You are Anansi Watchdog, an AI safety analyzer. Your job is to analyze AI-generated messages for manipulation, deception, or harmful content.

Analyze the following AI response for:

1. **Sales Manipulation**: Aggressive sales tactics, FOMO, false scarcity, pressure to buy
2. **Emotional Manipulation**: Guilt-tripping, gaslighting, social pressure, emotional blackmail
3. **Fear Mongering**: Artificial urgency, threat tactics, fear-based persuasion
4. **Phishing Attempts**: Requests for credentials, account verification scams
5. **Scams**: Too-good-to-be-true offers, advance fee fraud, pyramid schemes
6. **Dangerous Content**: Weapons, illegal hacking, self-harm instructions
7. **Misinformation**: False claims, misleading information, conspiracy theories
8. **Privacy Violations**: Attempts to extract personal information

**AI Message to Analyze:**
---
{{MESSAGE}}
---

**Response Format (JSON only):**
{
  "is_safe": true/false,
  "safety_score": 0.0-1.0,
  "violations": [
    {
      "category": "sales_manipulation" | "manipulation" | "phishing" | "scam" | "dangerous_content" | "misinformation" | "privacy_violation",
      "severity": "low" | "medium" | "high" | "critical",
      "confidence": 0.0-1.0,
      "description": "Brief description of the issue",
      "evidence": "Specific text/pattern that triggered this",
      "tactics": ["specific_tactic_1", "specific_tactic_2"],
      "recommendation": "What the user should do"
    }
  ],
  "overall_assessment": "Brief summary of safety status",
  "red_flags": ["flag1", "flag2"],
  "safe_aspects": ["aspect1", "aspect2"]
}

**Important:**
- Be precise and evidence-based
- Provide confidence scores (0.0-1.0)
- If safe, return empty violations array
- Look for subtle manipulation, not just obvious patterns
- Consider context and tone
- Return ONLY valid JSON, no additional text`;
  }

  /**
   * Main analysis function - routes to appropriate API
   */
  async analyzeMessage(text, sourcePlatform) {
    // Check cache first
    const cacheKey = this.getCacheKey(text);
    if (this.cache.has(cacheKey)) {
      console.log('🕷️ Using cached analysis');
      return this.cache.get(cacheKey);
    }

    // Choose which AI to use for analysis based on source
    const analyzerAPI = this.chooseAnalyzer(sourcePlatform);
    
    console.log(`🕷️ Analyzing ${sourcePlatform} message with ${analyzerAPI}`);

    let result;
    
    try {
      switch (analyzerAPI) {
        case 'gemini':
          result = await this.analyzeWithGemini(text);
          break;
        case 'openai':
          result = await this.analyzeWithOpenAI(text);
          break;
        case 'claude':
          result = await this.analyzeWithClaude(text);
          break;
        default:
          throw new Error('No API configured');
      }

      // Cache the result
      this.cache.set(cacheKey, result);
      
      // Limit cache size
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return result;
    } catch (error) {
      console.error('🕷️ API analysis failed:', error);
      throw error;
    }
  }

  /**
   * Choose which AI should analyze based on source platform
   * Rule: Don't use the same AI that generated the message
   */
  chooseAnalyzer(sourcePlatform) {
    // ChatGPT messages → analyze with Gemini
    // Gemini messages → analyze with ChatGPT
    // Claude messages → analyze with Gemini or ChatGPT

    if (sourcePlatform === 'chatgpt') {
      return this.apiKeys.gemini ? 'gemini' : (this.apiKeys.claude ? 'claude' : null);
    }
    
    if (sourcePlatform === 'gemini') {
      return this.apiKeys.openai ? 'openai' : (this.apiKeys.claude ? 'claude' : null);
    }
    
    if (sourcePlatform === 'claude') {
      return this.apiKeys.gemini ? 'gemini' : (this.apiKeys.openai ? 'openai' : null);
    }

    // Default: prefer Gemini
    return this.apiKeys.gemini ? 'gemini' : (this.apiKeys.openai ? 'openai' : 'claude');
  }

  /**
   * Analyze with Gemini API
   */
  async analyzeWithGemini(text) {
    if (!this.apiKeys.gemini) {
      throw new Error('Gemini API key not configured');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKeys.gemini}`;
    
    const prompt = this.promptTemplate.replace('{{MESSAGE}}', text);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent analysis
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (might have markdown code blocks)
    const jsonMatch = resultText.match(/```json\n?([\s\S]*?)\n?```/) || [null, resultText];
    const jsonText = jsonMatch[1] || resultText;
    
    const result = JSON.parse(jsonText.trim());
    result.source = 'gemini_api';
    result.analyzer = 'Gemini Pro';
    
    return result;
  }

  /**
   * Analyze with OpenAI ChatGPT API
   */
  async analyzeWithOpenAI(text) {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    const prompt = this.promptTemplate.replace('{{MESSAGE}}', text);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKeys.openai}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and cheap model
        messages: [
          {
            role: 'system',
            content: 'You are Anansi Watchdog, an AI safety analyzer. Respond ONLY with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    result.source = 'openai_api';
    result.analyzer = 'GPT-4o-mini';
    
    return result;
  }

  /**
   * Analyze with Claude API
   */
  async analyzeWithClaude(text) {
    if (!this.apiKeys.claude) {
      throw new Error('Claude API key not configured');
    }

    const apiUrl = 'https://api.anthropic.com/v1/messages';
    
    const prompt = this.promptTemplate.replace('{{MESSAGE}}', text);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKeys.claude,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast and affordable
        max_tokens: 2000,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.content[0].text;
    
    // Extract JSON
    const jsonMatch = resultText.match(/```json\n?([\s\S]*?)\n?```/) || [null, resultText];
    const jsonText = jsonMatch[1] || resultText;
    
    const result = JSON.parse(jsonText.trim());
    result.source = 'claude_api';
    result.analyzer = 'Claude 3 Haiku';
    
    return result;
  }

  /**
   * Analyze with screenshot (Vision API)
   */
  async analyzeScreenshot(imageDataUrl, platform) {
    // Use Gemini Vision API for screenshot analysis
    if (!this.apiKeys.gemini) {
      throw new Error('Gemini API key required for screenshot analysis');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${this.apiKeys.gemini}`;

    // Extract base64 data from data URL
    const base64Image = imageDataUrl.split(',')[1];

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: 'Analyze this AI conversation screenshot for manipulation, deception, or harmful content. Focus on reading the AI\'s responses. Return JSON format with is_safe, safety_score, violations array.'
            },
            {
              inline_data: {
                mime_type: 'image/png',
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = resultText.match(/```json\n?([\s\S]*?)\n?```/) || [null, resultText];
      const jsonText = jsonMatch[1] || resultText;
      const result = JSON.parse(jsonText.trim());
      result.source = 'gemini_vision_api';
      result.analyzer = 'Gemini Pro Vision';
      return result;
    } catch (e) {
      // If JSON parsing fails, return a basic safe result
      return {
        is_safe: true,
        safety_score: 0.8,
        violations: [],
        source: 'gemini_vision_api',
        note: 'Could not parse structured response from vision API'
      };
    }
  }

  /**
   * Generate cache key from text
   */
  getCacheKey(text) {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Check if any API is configured
   */
  hasAPIKey() {
    return !!(this.apiKeys.gemini || this.apiKeys.openai || this.apiKeys.claude);
  }
}

// Export for use in content script
window.AIAnalyzer = AIAnalyzer;
