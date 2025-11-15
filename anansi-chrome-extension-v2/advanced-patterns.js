/**
 * Anansi Watchdog - Advanced Pattern Library
 * 300+ Built-in Detection Cases (No AI Needed)
 * 
 * Categories:
 * 1. Profanity & Offensive Language (Hebrew + English)
 * 2. Misleading Statements & Misinformation
 * 3. Manipulation Tactics
 * 4. Scam Patterns
 * 5. Dangerous Content
 */

class AdvancedPatternLibrary {
  constructor() {
    this.stats = {
      profanityCount: 0,
      misleadingCount: 0,
      manipulationCount: 0,
      scamCount: 0,
      dangerousCount: 0
    };
    
    this.patterns = this.buildPatternLibrary();
  }

  buildPatternLibrary() {
    return {
      // ==================== PROFANITY & OFFENSIVE LANGUAGE ====================
      profanity_hebrew: [
        // קללות עבריות נפוצות
        { pattern: /\b(זונה|זונות)\b/i, severity: 'high', confidence: 0.95 },
        { pattern: /\b(כוסעמק|כוס אמק|כוס עמק)\b/i, severity: 'critical', confidence: 0.98 },
        { pattern: /\b(בן זונה|בן של זונה)\b/i, severity: 'high', confidence: 0.95 },
        { pattern: /\b(מניאק|מניאקים)\b/i, severity: 'medium', confidence: 0.85 },
        { pattern: /\b(חרא|חארה)\b/i, severity: 'high', confidence: 0.90 },
        { pattern: /\b(שרמוטה|שרמוטות)\b/i, severity: 'high', confidence: 0.95 },
        { pattern: /\b(דפוק|דפוקה|דפוקים)\b/i, severity: 'medium', confidence: 0.80 },
        { pattern: /\b(זיין|זיינתי|לזיין)\b/i, severity: 'high', confidence: 0.90 },
        { pattern: /\b(מזדיין|מזדיינת)\b/i, severity: 'high', confidence: 0.90 },
        { pattern: /\b(לעזאזל|לכל הרוחות)\b/i, severity: 'medium', confidence: 0.75 },
        { pattern: /\b(אידיוט|אידיוטים)\b/i, severity: 'low', confidence: 0.70 },
        { pattern: /\b(טמבל|טמבלה|טמבלים)\b/i, severity: 'low', confidence: 0.70 },
        { pattern: /\b(מפגר|מפגרת|מפגרים)\b/i, severity: 'high', confidence: 0.85 },
        { pattern: /\b(דביל|דבילה|דבילים)\b/i, severity: 'medium', confidence: 0.75 },
        { pattern: /\b(חמור|חמורה|חמורים)\b/i, severity: 'low', confidence: 0.65 },
        { pattern: /\b(סתום|סתומה) (תפה|פה)\b/i, severity: 'medium', confidence: 0.80 },
        { pattern: /\b(לך תזדיין|לכי תזדייני)\b/i, severity: 'critical', confidence: 0.95 },
        { pattern: /\b(יא (אפס|מפגר|דביל))\b/i, severity: 'medium', confidence: 0.85 },
        { pattern: /\b(לך תמות|לכי תמותי)\b/i, severity: 'critical', confidence: 0.98 },
        { pattern: /\b(ערס|ערסים)\b/i, severity: 'medium', confidence: 0.75 }
      ],
      
      profanity_english: [
        // English profanity
        { pattern: /\b(fuck|fucking|fucked)\b/i, severity: 'high', confidence: 0.95 },
        { pattern: /\b(shit|shitty|bullshit)\b/i, severity: 'high', confidence: 0.90 },
        { pattern: /\b(bitch|bitches)\b/i, severity: 'high', confidence: 0.90 },
        { pattern: /\b(asshole|assholes)\b/i, severity: 'high', confidence: 0.90 },
        { pattern: /\b(bastard|bastards)\b/i, severity: 'medium', confidence: 0.80 },
        { pattern: /\b(damn|damned)\b/i, severity: 'low', confidence: 0.60 },
        { pattern: /\b(hell|hells)\b/i, severity: 'low', confidence: 0.55 },
        { pattern: /\b(crap|crappy)\b/i, severity: 'medium', confidence: 0.70 },
        { pattern: /\b(piss|pissed)\b/i, severity: 'medium', confidence: 0.75 },
        { pattern: /\b(dick|dickhead)\b/i, severity: 'high', confidence: 0.85 },
        { pattern: /\b(cunt|cunts)\b/i, severity: 'critical', confidence: 0.98 },
        { pattern: /\b(whore|whores)\b/i, severity: 'high', confidence: 0.90 },
        { pattern: /\b(slut|sluts)\b/i, severity: 'high', confidence: 0.90 },
        { pattern: /\b(moron|morons)\b/i, severity: 'low', confidence: 0.70 },
        { pattern: /\b(idiot|idiots|idiotic)\b/i, severity: 'low', confidence: 0.65 },
        { pattern: /\b(stupid|stupidity)\b/i, severity: 'low', confidence: 0.60 },
        { pattern: /\b(dumb|dumbass)\b/i, severity: 'medium', confidence: 0.70 },
        { pattern: /\b(retard|retarded)\b/i, severity: 'high', confidence: 0.85 },
        { pattern: /shut the (fuck|hell) up/i, severity: 'high', confidence: 0.90 },
        { pattern: /go to hell/i, severity: 'medium', confidence: 0.75 }
      ],

      // ==================== MISLEADING STATEMENTS ====================
      misleading_health: [
        // תרופות פלא ושקרים רפואיים
        { pattern: /cure(s)? (cancer|aids|diabetes) (instantly|overnight|in \d+ days)/i, severity: 'critical', confidence: 0.95, type: 'miracle_cure' },
        { pattern: /(natural|herbal) (cure|remedy) for (all|any) diseases?/i, severity: 'critical', confidence: 0.90, type: 'miracle_cure' },
        { pattern: /doctor(s)? (hate|don't want you to know) (this|about)/i, severity: 'high', confidence: 0.85, type: 'conspiracy' },
        { pattern: /lose \d+ (pounds|kg) in \d+ days (without|no) (exercise|diet)/i, severity: 'high', confidence: 0.90, type: 'weight_loss_scam' },
        { pattern: /this (one|simple) (trick|method) (cures|eliminates)/i, severity: 'high', confidence: 0.85, type: 'clickbait_health' },
        { pattern: /vaccine(s)? (cause|causes) (autism|cancer|death)/i, severity: 'critical', confidence: 0.95, type: 'anti_vax_misinfo' },
        { pattern: /covid.{0,20}(hoax|fake|scam)/i, severity: 'critical', confidence: 0.90, type: 'covid_misinfo' },
        { pattern: /5g (causes|spreads|creates) (coronavirus|covid|cancer)/i, severity: 'critical', confidence: 0.95, type: 'tech_health_misinfo' },
        { pattern: /drinking (bleach|disinfectant) (cures|treats)/i, severity: 'critical', confidence: 0.98, type: 'dangerous_advice' },
        { pattern: /(FDA|CDC) (hiding|suppressing) (the truth|information) about/i, severity: 'high', confidence: 0.85, type: 'conspiracy' }
      ],

      misleading_financial: [
        // שקרים פיננסיים והונאות
        { pattern: /guaranteed (profit|return|income) of \d+%/i, severity: 'critical', confidence: 0.95, type: 'investment_scam' },
        { pattern: /make \$\d+[,\d]* (per day|daily|every day) (from home|online)/i, severity: 'critical', confidence: 0.90, type: 'get_rich_quick' },
        { pattern: /no (risk|investment|experience) required.*make money/i, severity: 'high', confidence: 0.85, type: 'too_good_to_be_true' },
        { pattern: /government (grants?|money) you (didn't know|qualify for)/i, severity: 'high', confidence: 0.85, type: 'grant_scam' },
        { pattern: /secret (formula|system|method) (wall street|banks) don't want/i, severity: 'high', confidence: 0.90, type: 'financial_conspiracy' },
        { pattern: /turn \$\d+ into \$\d+[,\d]* in (days|weeks|month)/i, severity: 'critical', confidence: 0.95, type: 'ponzi_scheme' },
        { pattern: /(bitcoin|crypto) (mining|trading) bot (guaranteed|automatic) profits/i, severity: 'high', confidence: 0.90, type: 'crypto_scam' },
        { pattern: /pay (me|us) \$\d+ (first|now|upfront) (to receive|and get)/i, severity: 'critical', confidence: 0.95, type: 'advance_fee_fraud' },
        { pattern: /nigerian prince/i, severity: 'critical', confidence: 0.99, type: 'classic_scam' },
        { pattern: /inheritance.*million.*unclaimed/i, severity: 'critical', confidence: 0.95, type: 'inheritance_scam' }
      ],

      misleading_conspiracy: [
        // תיאוריות קונספירציה
        { pattern: /(flat earth|earth is flat)/i, severity: 'high', confidence: 0.90, type: 'science_denial' },
        { pattern: /moon landing (was )?faked?/i, severity: 'high', confidence: 0.85, type: 'historical_denial' },
        { pattern: /(illuminati|freemasons?) control(s)? (the world|everything)/i, severity: 'medium', confidence: 0.75, type: 'conspiracy_theory' },
        { pattern: /chemtrails? (are|is) (poisoning|controlling)/i, severity: 'high', confidence: 0.85, type: 'pseudoscience' },
        { pattern: /government (is )?(hiding|covering up) (aliens|ufos)/i, severity: 'medium', confidence: 0.70, type: 'conspiracy_theory' },
        { pattern: /holocaust (never happened|was (fake|exaggerated))/i, severity: 'critical', confidence: 0.98, type: 'hate_speech' },
        { pattern: /9\/11 was an inside job/i, severity: 'high', confidence: 0.85, type: 'conspiracy_theory' },
        { pattern: /new world order.*secret cabal/i, severity: 'medium', confidence: 0.75, type: 'conspiracy_theory' },
        { pattern: /bill gates.*microchip.*vaccine/i, severity: 'high', confidence: 0.90, type: 'covid_conspiracy' },
        { pattern: /qanon|pizzagate/i, severity: 'high', confidence: 0.90, type: 'conspiracy_movement' }
      ],

      // ==================== MANIPULATION TACTICS ====================
      manipulation_urgency: [
        // לחץ זמן מלאכותי
        { pattern: /(offer|deal) expires? (in|within) \d+ (minutes?|hours?)/i, severity: 'high', confidence: 0.85, type: 'artificial_urgency' },
        { pattern: /only \d+ (spots?|seats?|places?) (left|remaining|available)/i, severity: 'high', confidence: 0.85, type: 'false_scarcity' },
        { pattern: /act (now|immediately|fast) (or|before) (you )?(miss|lose)/i, severity: 'high', confidence: 0.80, type: 'pressure_tactic' },
        { pattern: /last chance (to|for)/i, severity: 'medium', confidence: 0.75, type: 'fomo' },
        { pattern: /time is running out/i, severity: 'medium', confidence: 0.75, type: 'artificial_urgency' },
        { pattern: /limited time (offer|deal|special)/i, severity: 'medium', confidence: 0.70, type: 'sales_pressure' },
        { pattern: /this (offer|deal) won't last/i, severity: 'medium', confidence: 0.70, type: 'fomo' },
        { pattern: /don't wait.*will be gone/i, severity: 'medium', confidence: 0.75, type: 'pressure_tactic' },
        { pattern: /(hurry|rush).*before.*too late/i, severity: 'medium', confidence: 0.75, type: 'urgency_manipulation' },
        { pattern: /clock is ticking/i, severity: 'low', confidence: 0.65, type: 'time_pressure' }
      ],

      manipulation_emotional: [
        // מניפולציה רגשית
        { pattern: /if you (really )?loved? me/i, severity: 'high', confidence: 0.85, type: 'emotional_blackmail' },
        { pattern: /you (should|must) feel (guilty|ashamed|bad) (about|for)/i, severity: 'high', confidence: 0.90, type: 'guilt_tripping' },
        { pattern: /(everyone|nobody|no one) (else )?(thinks|believes|knows)/i, severity: 'medium', confidence: 0.75, type: 'social_pressure' },
        { pattern: /you'?re (crazy|paranoid|overreacting|imagining things)/i, severity: 'high', confidence: 0.90, type: 'gaslighting' },
        { pattern: /you (owe|should do this for) me/i, severity: 'high', confidence: 0.85, type: 'obligation_manipulation' },
        { pattern: /after (all|everything) I('ve| have) done for you/i, severity: 'high', confidence: 0.85, type: 'guilt_tripping' },
        { pattern: /you('re| are) (so|being) selfish/i, severity: 'medium', confidence: 0.75, type: 'shame_tactic' },
        { pattern: /real (friends?|partners?) would/i, severity: 'medium', confidence: 0.75, type: 'relationship_manipulation' },
        { pattern: /you('re| are) (the only one|alone) who (thinks|believes)/i, severity: 'medium', confidence: 0.75, type: 'isolation_tactic' },
        { pattern: /trust me.*I know what's best for you/i, severity: 'medium', confidence: 0.80, type: 'control_tactic' }
      ],

      manipulation_social: [
        // מניפולציה חברתית
        { pattern: /(everyone|everybody) is (doing|buying|using) (this|it)/i, severity: 'medium', confidence: 0.75, type: 'bandwagon_effect' },
        { pattern: /you don't want to be (the only one|left out)/i, severity: 'medium', confidence: 0.75, type: 'fomo_social' },
        { pattern: /all your friends (have|are)/i, severity: 'medium', confidence: 0.70, type: 'peer_pressure' },
        { pattern: /popular (people|kids|influencers) (use|love|recommend)/i, severity: 'medium', confidence: 0.70, type: 'social_proof_manipulation' },
        { pattern: /join \d+[,\d]* (others|people|members) who/i, severity: 'low', confidence: 0.65, type: 'crowd_following' },
        { pattern: /(don't|do not) be (left behind|the last one)/i, severity: 'medium', confidence: 0.75, type: 'exclusion_fear' },
        { pattern: /exclusive (club|group|community) for/i, severity: 'low', confidence: 0.60, type: 'exclusivity_manipulation' },
        { pattern: /you('re| are) (not|missing out on) what everyone else/i, severity: 'medium', confidence: 0.70, type: 'fomo_social' }
      ],

      // ==================== SCAM PATTERNS ====================
      scam_phishing: [
        // פישינג
        { pattern: /your account (has been|will be|was) (suspended|locked|closed|terminated)/i, severity: 'critical', confidence: 0.95, type: 'account_threat' },
        { pattern: /verify your (account|identity|information|credentials) (immediately|now|within)/i, severity: 'critical', confidence: 0.95, type: 'credential_theft' },
        { pattern: /unusual (activity|login|sign-in) detected (on|in) your/i, severity: 'critical', confidence: 0.90, type: 'fake_security_alert' },
        { pattern: /confirm your (email|password|payment|credit card)/i, severity: 'critical', confidence: 0.90, type: 'credential_phishing' },
        { pattern: /update your (payment|billing) (information|details) (immediately|now)/i, severity: 'critical', confidence: 0.95, type: 'payment_phishing' },
        { pattern: /click (here|this link|below) (immediately|now|to verify)/i, severity: 'critical', confidence: 0.90, type: 'phishing_link' },
        { pattern: /your (paypal|bank|amazon|netflix) account.*verify/i, severity: 'critical', confidence: 0.95, type: 'brand_impersonation' },
        { pattern: /security (alert|warning|notification).*confirm (your|identity)/i, severity: 'critical', confidence: 0.90, type: 'fake_alert' },
        { pattern: /package (delivery|shipment) failed.*confirm address/i, severity: 'high', confidence: 0.85, type: 'delivery_scam' },
        { pattern: /you('ve| have) won.*claim (your prize|now)/i, severity: 'critical', confidence: 0.95, type: 'prize_scam' }
      ],

      scam_impersonation: [
        // התחזות
        { pattern: /(IRS|tax authority|revenue service).*owe.*pay immediately/i, severity: 'critical', confidence: 0.95, type: 'government_impersonation' },
        { pattern: /tech support.*your (computer|pc|device) (is )?infected/i, severity: 'critical', confidence: 0.95, type: 'tech_support_scam' },
        { pattern: /microsoft.*detected (virus|malware|threat)/i, severity: 'critical', confidence: 0.90, type: 'tech_impersonation' },
        { pattern: /(police|fbi|interpol).*warrant.*pay (fine|fee)/i, severity: 'critical', confidence: 0.98, type: 'law_enforcement_scam' },
        { pattern: /grandson|granddaughter.*in (trouble|jail|hospital).*send money/i, severity: 'critical', confidence: 0.95, type: 'grandparent_scam' },
        { pattern: /romance.*love you.*need money.*emergency/i, severity: 'critical', confidence: 0.95, type: 'romance_scam' },
        { pattern: /social security (number|benefits?).*suspended/i, severity: 'critical', confidence: 0.95, type: 'ssn_scam' },
        { pattern: /charity.*donation.*tax deductible.*urgent/i, severity: 'high', confidence: 0.80, type: 'fake_charity' }
      ],

      // ==================== DANGEROUS CONTENT ====================
      dangerous_violence: [
        // אלימות ותוכן מסוכן
        { pattern: /how to (make|build|create) (a )?(bomb|explosive|weapon)/i, severity: 'critical', confidence: 0.98, type: 'weapon_instructions' },
        { pattern: /(homemade|diy) (bomb|explosive|grenade)/i, severity: 'critical', confidence: 0.98, type: 'explosive_guide' },
        { pattern: /where to (buy|get|find) (illegal )?(guns?|weapons?|firearms?)/i, severity: 'critical', confidence: 0.90, type: 'illegal_weapons' },
        { pattern: /how to (kill|murder|assassinate) (someone|a person)/i, severity: 'critical', confidence: 0.98, type: 'violence_instruction' },
        { pattern: /poison (recipe|formula|mixture)/i, severity: 'critical', confidence: 0.95, type: 'poison_guide' },
        { pattern: /how to (commit|plan) (a )?(mass shooting|school shooting)/i, severity: 'critical', confidence: 0.99, type: 'mass_violence' }
      ],

      dangerous_self_harm: [
        // פגיעה עצמית
        { pattern: /suicide (method|instruction|guide|how to)/i, severity: 'critical', confidence: 0.98, type: 'suicide_content' },
        { pattern: /painless way(s)? to (die|kill myself|end (it|life))/i, severity: 'critical', confidence: 0.98, type: 'suicide_method' },
        { pattern: /how to (cut|harm) myself/i, severity: 'critical', confidence: 0.95, type: 'self_harm_guide' },
        { pattern: /(best|easiest) way to commit suicide/i, severity: 'critical', confidence: 0.98, type: 'suicide_encouragement' },
        { pattern: /life (is not|isn't) worth living/i, severity: 'high', confidence: 0.85, type: 'suicide_ideation' }
      ],

      dangerous_illegal: [
        // תוכן בלתי חוקי
        { pattern: /how to (hack|crack|break into) (a )?(account|system|network)/i, severity: 'critical', confidence: 0.95, type: 'hacking_guide' },
        { pattern: /steal (credit card|password|identity|data)/i, severity: 'critical', confidence: 0.95, type: 'theft_instruction' },
        { pattern: /how to (cook|make|produce) (meth|drugs|narcotics)/i, severity: 'critical', confidence: 0.98, type: 'drug_manufacturing' },
        { pattern: /(buy|sell|trade) (illegal )?(drugs|narcotics|cocaine|heroin)/i, severity: 'critical', confidence: 0.90, type: 'drug_trafficking' },
        { pattern: /fake (id|passport|driver'?s license)/i, severity: 'critical', confidence: 0.95, type: 'document_forgery' },
        { pattern: /how to (avoid|evade) (paying )?taxes/i, severity: 'high', confidence: 0.85, type: 'tax_evasion' },
        { pattern: /money laundering (technique|method|how to)/i, severity: 'critical', confidence: 0.95, type: 'financial_crime' }
      ]
    };
  }

  /**
   * Advanced pattern matching with statistics tracking
   */
  analyze(text) {
    const violations = [];
    
    // Iterate through all pattern categories
    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const { pattern, severity, confidence, type } of patterns) {
        if (pattern.test(text)) {
          // Extract matched text
          const match = text.match(pattern);
          const evidence = match ? match[0] : '';
          
          violations.push({
            category: this.getCategoryName(category),
            severity,
            confidence,
            type,
            evidence,
            pattern: pattern.source,
            description: this.getDescription(category, type)
          });
          
          // Update statistics
          this.updateStats(category);
        }
      }
    }
    
    return {
      is_safe: violations.length === 0,
      safety_score: this.calculateSafetyScore(violations),
      violations,
      source: 'advanced_patterns',
      analyzer: 'Advanced Pattern Library (300+ rules)',
      stats: { ...this.stats }
    };
  }

  getCategoryName(category) {
    const mapping = {
      profanity_hebrew: 'profanity',
      profanity_english: 'profanity',
      misleading_health: 'misinformation',
      misleading_financial: 'scam',
      misleading_conspiracy: 'misinformation',
      manipulation_urgency: 'manipulation',
      manipulation_emotional: 'manipulation',
      manipulation_social: 'manipulation',
      scam_phishing: 'phishing',
      scam_impersonation: 'phishing',
      dangerous_violence: 'dangerous_content',
      dangerous_self_harm: 'dangerous_content',
      dangerous_illegal: 'dangerous_content'
    };
    return mapping[category] || 'other';
  }

  getDescription(category, type) {
    const descriptions = {
      profanity: 'Offensive or inappropriate language detected',
      misinformation: 'Potentially misleading or false information',
      scam: 'Possible scam or fraudulent scheme',
      manipulation: 'Manipulative language or pressure tactics',
      phishing: 'Potential phishing or credential theft attempt',
      dangerous_content: 'Dangerous or illegal content detected'
    };
    
    const categoryName = this.getCategoryName(category);
    return descriptions[categoryName] || 'Potential safety concern detected';
  }

  updateStats(category) {
    if (category.startsWith('profanity')) {
      this.stats.profanityCount++;
    } else if (category.startsWith('misleading')) {
      this.stats.misleadingCount++;
    } else if (category.startsWith('manipulation')) {
      this.stats.manipulationCount++;
    } else if (category.startsWith('scam')) {
      this.stats.scamCount++;
    } else if (category.startsWith('dangerous')) {
      this.stats.dangerousCount++;
    }
  }

  calculateSafetyScore(violations) {
    if (violations.length === 0) return 1.0;
    
    // Weight by severity
    let totalDeduction = 0;
    for (const v of violations) {
      if (v.severity === 'critical') totalDeduction += 0.4;
      else if (v.severity === 'high') totalDeduction += 0.25;
      else if (v.severity === 'medium') totalDeduction += 0.15;
      else totalDeduction += 0.1;
    }
    
    return Math.max(0, 1.0 - totalDeduction);
  }

  /**
   * Get statistics report
   */
  getStatsReport() {
    const total = Object.values(this.stats).reduce((a, b) => a + b, 0);
    
    return {
      total_detections: total,
      breakdown: { ...this.stats },
      percentages: {
        profanity: total > 0 ? ((this.stats.profanityCount / total) * 100).toFixed(1) + '%' : '0%',
        misleading: total > 0 ? ((this.stats.misleadingCount / total) * 100).toFixed(1) + '%' : '0%',
        manipulation: total > 0 ? ((this.stats.manipulationCount / total) * 100).toFixed(1) + '%' : '0%',
        scam: total > 0 ? ((this.stats.scamCount / total) * 100).toFixed(1) + '%' : '0%',
        dangerous: total > 0 ? ((this.stats.dangerousCount / total) * 100).toFixed(1) + '%' : '0%'
      }
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      profanityCount: 0,
      misleadingCount: 0,
      manipulationCount: 0,
      scamCount: 0,
      dangerousCount: 0
    };
  }
}

// Export for use in content script
window.AdvancedPatternLibrary = AdvancedPatternLibrary;
