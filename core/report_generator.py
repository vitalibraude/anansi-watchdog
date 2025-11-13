"""
Report Generator

Generates comprehensive reports from test results and evaluations.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from core.test_runner import TestResult
from evaluators.risk_score import RiskAssessment


class ReportGenerator:
    """Generates various report formats from test results"""
    
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = Path(output_dir)
        self.reports_dir = self.output_dir / "reports"
        self.reports_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_markdown_report(
        self,
        test_results: List[TestResult],
        risk_assessments: List[RiskAssessment],
        test_suite_id: str,
        title: str = "Anansi Watchdog Evaluation Report"
    ) -> str:
        """
        Generate comprehensive Markdown report
        
        Args:
            test_results: List of TestResult objects
            risk_assessments: List of RiskAssessment objects
            test_suite_id: Unique test suite identifier
            title: Report title
        
        Returns:
            Path to generated report file
        """
        # Group results by model
        results_by_model = {}
        for result, assessment in zip(test_results, risk_assessments):
            model = result.model_name
            if model not in results_by_model:
                results_by_model[model] = []
            results_by_model[model].append((result, assessment))
        
        # Generate report content
        report = self._generate_report_header(title, test_suite_id)
        report += self._generate_executive_summary(results_by_model)
        report += self._generate_model_rankings(results_by_model)
        report += self._generate_detailed_results(results_by_model)
        report += self._generate_risk_analysis(results_by_model)
        report += self._generate_recommendations(results_by_model)
        report += self._generate_footer()
        
        # Save report
        filename = f"report_{test_suite_id}.md"
        report_path = self.reports_dir / filename
        
        with open(report_path, 'w') as f:
            f.write(report)
        
        print(f"📄 Markdown report generated: {report_path}")
        return str(report_path)
    
    def _generate_report_header(self, title: str, test_suite_id: str) -> str:
        """Generate report header"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return f"""# {title}

**Test Suite ID:** `{test_suite_id}`  
**Generated:** {timestamp}  
**Framework:** Anansi Watchdog v1.0

---

"""
    
    def _generate_executive_summary(self, results_by_model: Dict) -> str:
        """Generate executive summary section"""
        total_tests = sum(len(results) for results in results_by_model.values())
        total_models = len(results_by_model)
        
        # Calculate aggregate statistics
        all_assessments = [a for results in results_by_model.values() for _, a in results]
        avg_overall = sum(a.overall_risk_score for a in all_assessments) / len(all_assessments)
        critical_count = sum(1 for a in all_assessments if a.risk_level == 'critical')
        high_risk_count = sum(1 for a in all_assessments if a.risk_level == 'high')
        passed_count = sum(1 for a in all_assessments if a.passed)
        
        return f"""## 📊 Executive Summary

- **Total Tests Conducted:** {total_tests}
- **Models Evaluated:** {total_models}
- **Average Overall Score:** {avg_overall:.2f}/1.00
- **Pass Rate:** {(passed_count/len(all_assessments)*100):.1f}%
- **Critical Issues:** {critical_count}
- **High Risk Issues:** {high_risk_count}

"""
    
    def _generate_model_rankings(self, results_by_model: Dict) -> str:
        """Generate model rankings section"""
        # Calculate average scores per model
        model_scores = {}
        for model, results in results_by_model.items():
            assessments = [a for _, a in results]
            model_scores[model] = {
                'avg_score': sum(a.overall_risk_score for a in assessments) / len(assessments),
                'pass_rate': sum(1 for a in assessments if a.passed) / len(assessments),
                'total_tests': len(assessments)
            }
        
        # Sort by average score
        ranked = sorted(model_scores.items(), key=lambda x: x[1]['avg_score'], reverse=True)
        
        report = "## 🏆 Model Rankings\n\n"
        report += "| Rank | Model | Avg Score | Pass Rate | Tests |\n"
        report += "|------|-------|-----------|-----------|-------|\n"
        
        for i, (model, stats) in enumerate(ranked, 1):
            medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
            report += f"| {medal} | {model} | {stats['avg_score']:.3f} | {stats['pass_rate']*100:.1f}% | {stats['total_tests']} |\n"
        
        report += "\n"
        return report
    
    def _generate_detailed_results(self, results_by_model: Dict) -> str:
        """Generate detailed results section"""
        report = "## 📋 Detailed Results by Model\n\n"
        
        for model, results in results_by_model.items():
            report += f"### {model}\n\n"
            
            # Calculate model statistics
            assessments = [a for _, a in results]
            avg_safety = sum(a.safety_score for a in assessments) / len(assessments)
            avg_bias = sum(a.bias_score for a in assessments) / len(assessments)
            avg_hallucination = sum(a.hallucination_score for a in assessments) / len(assessments)
            
            report += "**Average Scores:**\n"
            report += f"- Safety: {avg_safety:.3f} {self._score_emoji(avg_safety)}\n"
            report += f"- Bias: {avg_bias:.3f} {self._score_emoji(avg_bias)}\n"
            report += f"- Hallucination: {avg_hallucination:.3f} {self._score_emoji(avg_hallucination)}\n\n"
            
            # Count issues by severity
            critical = sum(1 for a in assessments if a.risk_level == 'critical')
            high = sum(1 for a in assessments if a.risk_level == 'high')
            medium = sum(1 for a in assessments if a.risk_level == 'medium')
            
            report += "**Risk Distribution:**\n"
            report += f"- Critical: {critical}\n"
            report += f"- High: {high}\n"
            report += f"- Medium: {medium}\n"
            report += f"- Low/Safe: {len(assessments) - critical - high - medium}\n\n"
            
            report += "---\n\n"
        
        return report
    
    def _generate_risk_analysis(self, results_by_model: Dict) -> str:
        """Generate risk analysis section"""
        report = "## ⚠️ Risk Analysis\n\n"
        
        # Collect all risk factors
        all_risk_factors = {}
        for model, results in results_by_model.items():
            for _, assessment in results:
                for factor in assessment.risk_factors:
                    if factor not in all_risk_factors:
                        all_risk_factors[factor] = []
                    all_risk_factors[factor].append(model)
        
        if not all_risk_factors:
            report += "*No significant risk factors detected across all models.* ✅\n\n"
            return report
        
        # Sort by frequency
        sorted_factors = sorted(
            all_risk_factors.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )
        
        report += "### Most Common Issues\n\n"
        for factor, models in sorted_factors[:10]:  # Top 10
            report += f"- **{factor}**\n"
            report += f"  - Affected models: {', '.join(set(models))}\n"
            report += f"  - Occurrences: {len(models)}\n\n"
        
        return report
    
    def _generate_recommendations(self, results_by_model: Dict) -> str:
        """Generate recommendations section"""
        report = "## 💡 Recommendations\n\n"
        
        # Collect unique recommendations
        all_recommendations = set()
        for model, results in results_by_model.items():
            for _, assessment in results:
                all_recommendations.update(assessment.recommendations)
        
        # Categorize recommendations
        critical_recs = [r for r in all_recommendations if '🚨' in r]
        review_recs = [r for r in all_recommendations if '⚡' in r]
        general_recs = [r for r in all_recommendations if '⚠️' in r or '⚖️' in r or '🔍' in r]
        
        if critical_recs:
            report += "### Critical Actions Required\n\n"
            for rec in critical_recs:
                report += f"- {rec}\n"
            report += "\n"
        
        if review_recs:
            report += "### Review Recommended\n\n"
            for rec in review_recs:
                report += f"- {rec}\n"
            report += "\n"
        
        if general_recs:
            report += "### General Improvements\n\n"
            for rec in general_recs:
                report += f"- {rec}\n"
            report += "\n"
        
        return report
    
    def _generate_footer(self) -> str:
        """Generate report footer"""
        return """---

## About Anansi Watchdog

Anansi Watchdog is an open-source AI evaluation framework that monitors AI models for safety, bias, hallucinations, and alignment with human values.

**Learn more:** [github.com/anansi-watchdog](https://github.com/anansi-watchdog)

*Generated with Anansi Watchdog v1.0*
"""
    
    def _score_emoji(self, score: float) -> str:
        """Get emoji for score"""
        if score >= 0.9:
            return "🟢"
        elif score >= 0.7:
            return "🟡"
        elif score >= 0.5:
            return "🟠"
        else:
            return "🔴"
    
    def generate_json_report(
        self,
        test_results: List[TestResult],
        risk_assessments: List[RiskAssessment],
        test_suite_id: str
    ) -> str:
        """
        Generate JSON format report
        
        Args:
            test_results: List of TestResult objects
            risk_assessments: List of RiskAssessment objects
            test_suite_id: Unique test suite identifier
        
        Returns:
            Path to generated JSON file
        """
        report_data = {
            'test_suite_id': test_suite_id,
            'timestamp': datetime.now().isoformat(),
            'total_tests': len(test_results),
            'results': []
        }
        
        for result, assessment in zip(test_results, risk_assessments):
            report_data['results'].append({
                'test_result': result.to_dict(),
                'risk_assessment': {
                    'overall_risk_score': assessment.overall_risk_score,
                    'safety_score': assessment.safety_score,
                    'bias_score': assessment.bias_score,
                    'hallucination_score': assessment.hallucination_score,
                    'risk_level': assessment.risk_level,
                    'risk_factors': assessment.risk_factors,
                    'recommendations': assessment.recommendations,
                    'passed': assessment.passed
                }
            })
        
        filename = f"report_{test_suite_id}.json"
        report_path = self.reports_dir / filename
        
        with open(report_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"📄 JSON report generated: {report_path}")
        return str(report_path)
