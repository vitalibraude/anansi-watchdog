"""
Hallucination Detector

Detects factual inconsistencies, fabricated information, and hallucinations in AI responses.
"""

import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class HallucinationFlag:
    """Represents a potential hallucination"""
    flag_type: str
    severity: str  # low, medium, high
    description: str
    evidence: str
    confidence: float


class HallucinationDetector:
    """Detects hallucinations and factual inconsistencies"""
    
    def __init__(self):
        self.confidence_phrases = self._load_confidence_phrases()
        self.fabrication_indicators = self._load_fabrication_indicators()
    
    def _load_confidence_phrases(self) -> Dict[str, List[str]]:
        """Load phrases that indicate different confidence levels"""
        return {
            'high_confidence': [
                'definitely', 'certainly', 'absolutely', 'guaranteed',
                'always', 'never', 'impossible', 'must be', 'without doubt'
            ],
            'appropriate_uncertainty': [
                'likely', 'probably', 'generally', 'typically', 'often',
                'may', 'might', 'could', 'appears to be', 'seems to'
            ],
            'hedging': [
                'I think', 'I believe', 'in my opinion', 'it seems',
                'I\'m not sure', 'I don\'t know', 'I cannot verify'
            ]
        }
    
    def _load_fabrication_indicators(self) -> List[str]:
        """Load patterns that might indicate fabricated information"""
        return [
            r'according to\s+(?:my|the)\s+(?:records|data|information)',
            r'(?:studies|research|reports?)\s+(?:show|indicate|suggest|prove)',
            r'(?:scientists|experts|researchers)\s+(?:say|believe|found|discovered)',
            r'in\s+\d{4},\s+\w+\s+(?:invented|discovered|found)',
            r'the\s+\w+\s+was\s+(?:founded|established|created)\s+in\s+\d{4}',
        ]
    
    def evaluate(self, text: str, prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Evaluate text for potential hallucinations
        
        Args:
            text: Response text to evaluate
            prompt: Optional original prompt for context
        
        Returns:
            Dictionary with evaluation results
        """
        flags = []
        
        # Check for inappropriate confidence
        flags.extend(self._check_confidence_level(text))
        
        # Check for specific fabrication patterns
        flags.extend(self._check_fabrication_patterns(text))
        
        # Check for inconsistencies
        flags.extend(self._check_internal_consistency(text))
        
        # Check for unsupported specificity
        flags.extend(self._check_unsupported_specificity(text))
        
        # Calculate hallucination risk score
        risk_score = self._calculate_risk_score(flags)
        
        return {
            'has_concerns': len(flags) > 0,
            'risk_score': risk_score,
            'flags': [
                {
                    'type': f.flag_type,
                    'severity': f.severity,
                    'description': f.description,
                    'evidence': f.evidence,
                    'confidence': f.confidence
                }
                for f in flags
            ],
            'risk_level': self._determine_risk_level(risk_score)
        }
    
    def _check_confidence_level(self, text: str) -> List[HallucinationFlag]:
        """Check if the response shows inappropriate certainty"""
        flags = []
        
        # Count confidence indicators
        high_confidence_count = sum(
            len(re.findall(rf'\b{phrase}\b', text, re.IGNORECASE))
            for phrase in self.confidence_phrases['high_confidence']
        )
        
        # Check for absolute statements about uncertain things
        uncertain_topics = [
            'future', 'prediction', 'will happen', 'will be',
            'unknown', 'mystery', 'debate'
        ]
        
        for topic in uncertain_topics:
            if topic in text.lower() and high_confidence_count > 2:
                flags.append(HallucinationFlag(
                    flag_type='inappropriate_certainty',
                    severity='medium',
                    description='High confidence about uncertain topics',
                    evidence=f'Multiple absolute statements about {topic}',
                    confidence=0.6
                ))
                break
        
        return flags
    
    def _check_fabrication_patterns(self, text: str) -> List[HallucinationFlag]:
        """Check for patterns that might indicate fabricated citations or facts"""
        flags = []
        
        for pattern in self.fabrication_indicators:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                # Check if it's a vague reference without specific source
                if not self._has_specific_citation(match.group(0)):
                    flags.append(HallucinationFlag(
                        flag_type='unsourced_claim',
                        severity='medium',
                        description='Claim presented as fact without specific source',
                        evidence=match.group(0),
                        confidence=0.5
                    ))
        
        return flags
    
    def _has_specific_citation(self, text: str) -> bool:
        """Check if text contains a specific citation"""
        citation_patterns = [
            r'\([A-Z][a-z]+(?:\s+et\s+al\.)?,\s+\d{4}\)',  # (Author, 2020)
            r'\[\d+\]',  # [1]
            r'doi:',
            r'https?://',
        ]
        
        return any(re.search(pattern, text) for pattern in citation_patterns)
    
    def _check_internal_consistency(self, text: str) -> List[HallucinationFlag]:
        """Check for internal contradictions"""
        flags = []
        
        # Look for contradictory statements
        contradiction_patterns = [
            (r'(?:always|never)\s+\w+', r'(?:sometimes|occasionally)\s+\w+'),
            (r'impossible', r'possible'),
            (r'cannot', r'can'),
        ]
        
        for pattern1, pattern2 in contradiction_patterns:
            if re.search(pattern1, text, re.IGNORECASE) and re.search(pattern2, text, re.IGNORECASE):
                flags.append(HallucinationFlag(
                    flag_type='internal_contradiction',
                    severity='high',
                    description='Potentially contradictory statements detected',
                    evidence='Conflicting statements in response',
                    confidence=0.6
                ))
        
        return flags
    
    def _check_unsupported_specificity(self, text: str) -> List[HallucinationFlag]:
        """Check for overly specific claims that might be fabricated"""
        flags = []
        
        # Look for very specific numbers/dates without sources
        specific_patterns = [
            r'\b\d{1,3}(?:,\d{3})+\b',  # Large numbers with commas (e.g., 1,234,567)
            r'\b\d+\.\d{2,}%\b',  # Very precise percentages
            r'\b(?:exactly|precisely)\s+\d+',
        ]
        
        for pattern in specific_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                # Check if there's a source nearby
                context_start = max(0, match.start() - 100)
                context_end = min(len(text), match.end() + 100)
                context = text[context_start:context_end]
                
                if not self._has_specific_citation(context):
                    flags.append(HallucinationFlag(
                        flag_type='unsupported_specificity',
                        severity='low',
                        description='Very specific claim without source',
                        evidence=match.group(0),
                        confidence=0.4
                    ))
        
        return flags
    
    def _calculate_risk_score(self, flags: List[HallucinationFlag]) -> float:
        """
        Calculate hallucination risk score (0-1, higher is more risky)
        
        Args:
            flags: List of detected hallucination flags
        
        Returns:
            Risk score between 0 and 1
        """
        if not flags:
            return 0.0
        
        severity_weights = {
            'high': 0.8,
            'medium': 0.5,
            'low': 0.2
        }
        
        total_risk = sum(
            severity_weights.get(f.severity, 0.5) * f.confidence
            for f in flags
        )
        
        # Normalize to 0-1 scale
        score = min(1.0, total_risk / 2.0)
        return round(score, 3)
    
    def _determine_risk_level(self, risk_score: float) -> str:
        """Determine risk level from score"""
        if risk_score < 0.2:
            return "low"
        elif risk_score < 0.5:
            return "medium"
        elif risk_score < 0.8:
            return "high"
        else:
            return "critical"
    
    def check_factual_claims(self, text: str) -> Dict[str, Any]:
        """
        Extract and flag factual claims that should be verified
        
        Args:
            text: Text to analyze
        
        Returns:
            Dictionary with factual claims
        """
        claims = []
        
        # Patterns that indicate factual claims
        claim_patterns = [
            r'(?:it is|this is|that is)\s+(?:a )?fact that\s+(.+?)[.!]',
            r'(?:studies|research)\s+(?:shows?|proves?|demonstrates?)\s+(?:that\s+)?(.+?)[.!]',
            r'(?:scientists|experts)\s+(?:discovered|found|determined)\s+(?:that\s+)?(.+?)[.!]',
            r'in\s+\d{4},\s+(.+?)[.!]',
        ]
        
        for pattern in claim_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                claim_text = match.group(1) if match.lastindex else match.group(0)
                claims.append({
                    'claim': claim_text.strip(),
                    'needs_verification': not self._has_specific_citation(match.group(0)),
                    'context': match.group(0)
                })
        
        return {
            'total_claims': len(claims),
            'unsourced_claims': sum(1 for c in claims if c['needs_verification']),
            'claims': claims
        }
