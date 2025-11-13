#!/usr/bin/env python3
"""
Anansi Watchdog - Main CLI

Command-line interface for running AI model evaluations.
"""

import argparse
import sys
from pathlib import Path

from core.model_interface import ModelFactory
from core.test_runner import TestRunner
from core.report_generator import ReportGenerator
from evaluators import SafetyEvaluator, BiasDetector, HallucinationDetector, RiskScoreCalculator


def run_evaluation(
    test_files: list,
    models: list,
    output_dir: str = "outputs"
):
    """
    Run complete evaluation suite
    
    Args:
        test_files: List of test JSON files
        models: List of model identifiers (e.g., ['openai:gpt-4', 'anthropic:claude-3-5-sonnet'])
        output_dir: Directory for output files
    """
    print("🕷️  Anansi Watchdog - AI Model Evaluation")
    print("=" * 60)
    
    # Initialize models
    print("\n📦 Initializing models...")
    model_interfaces = {}
    for model_spec in models:
        try:
            if ':' in model_spec:
                provider, model_name = model_spec.split(':', 1)
                model_interfaces[model_name] = ModelFactory.create(provider, model_name)
            else:
                # Default model for provider
                model_interfaces[model_spec] = ModelFactory.create(model_spec)
            print(f"  ✅ {model_spec}")
        except Exception as e:
            print(f"  ❌ Failed to initialize {model_spec}: {e}")
    
    if not model_interfaces:
        print("\n❌ No models initialized. Exiting.")
        return
    
    # Initialize test runner
    test_runner = TestRunner(model_interfaces, output_dir)
    
    # Load and run tests
    print(f"\n📝 Loading test cases...")
    all_test_cases = []
    for test_file in test_files:
        try:
            test_cases = test_runner.load_test_cases(test_file)
            all_test_cases.extend(test_cases)
            print(f"  ✅ Loaded {len(test_cases)} tests from {test_file}")
        except Exception as e:
            print(f"  ❌ Failed to load {test_file}: {e}")
    
    if not all_test_cases:
        print("\n❌ No test cases loaded. Exiting.")
        return
    
    # Run tests
    print(f"\n🚀 Running {len(all_test_cases)} test cases...")
    results = test_runner.run_test_suite(all_test_cases)
    
    # Evaluate results
    print("\n🔍 Evaluating responses...")
    safety_evaluator = SafetyEvaluator()
    bias_detector = BiasDetector()
    hallucination_detector = HallucinationDetector()
    risk_calculator = RiskScoreCalculator()
    
    risk_assessments = []
    for result in results:
        # Evaluate each response
        safety_eval = safety_evaluator.evaluate(result.response, result.prompt)
        bias_eval = bias_detector.evaluate(result.response, result.prompt)
        hallucination_eval = hallucination_detector.evaluate(result.response, result.prompt)
        
        # Calculate risk assessment
        risk_assessment = risk_calculator.calculate(
            safety_eval,
            bias_eval,
            hallucination_eval
        )
        risk_assessments.append(risk_assessment)
        
        # Store evaluation in result
        result.evaluation_score = risk_assessment.overall_risk_score
        result.passed = risk_assessment.passed
        result.evaluation_details = {
            'safety': safety_eval,
            'bias': bias_eval,
            'hallucination': hallucination_eval
        }
        result.flags = risk_assessment.risk_factors
    
    # Generate reports
    print("\n📊 Generating reports...")
    report_generator = ReportGenerator(output_dir)
    
    md_report = report_generator.generate_markdown_report(
        results,
        risk_assessments,
        test_runner.test_suite_id
    )
    
    json_report = report_generator.generate_json_report(
        results,
        risk_assessments,
        test_runner.test_suite_id
    )
    
    # Save raw results
    results_file = test_runner.save_results()
    
    # Print summary
    test_runner.print_summary()
    
    print("\n" + "=" * 60)
    print("✅ Evaluation complete!")
    print(f"\nReports generated:")
    print(f"  📄 Markdown: {md_report}")
    print(f"  📄 JSON: {json_report}")
    print(f"  📄 Raw data: {results_file}")
    print("\n" + "=" * 60)


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Anansi Watchdog - AI Model Safety & Alignment Evaluator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run safety tests on GPT-4 and Claude
  python anansi.py -t tests/safety/*.json -m openai:gpt-4 anthropic:claude-3-5-sonnet
  
  # Run all tests on multiple models
  python anansi.py -t tests/*/*.json -m openai:gpt-4 google:gemini-pro
  
  # Run specific test suite
  python anansi.py -t tests/bias/gender_bias.json -m openai:gpt-4
        """
    )
    
    parser.add_argument(
        '-t', '--tests',
        nargs='+',
        required=True,
        help='Test files to run (supports wildcards)'
    )
    
    parser.add_argument(
        '-m', '--models',
        nargs='+',
        required=True,
        help='Models to test (format: provider:model_name or just provider for default)'
    )
    
    parser.add_argument(
        '-o', '--output',
        default='outputs',
        help='Output directory for results and reports (default: outputs)'
    )
    
    args = parser.parse_args()
    
    # Expand wildcards in test files
    test_files = []
    for pattern in args.tests:
        test_files.extend(str(p) for p in Path('.').glob(pattern) if p.is_file())
    
    if not test_files:
        print("❌ No test files found matching patterns:", args.tests)
        sys.exit(1)
    
    # Run evaluation
    try:
        run_evaluation(test_files, args.models, args.output)
    except KeyboardInterrupt:
        print("\n\n⚠️  Evaluation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error during evaluation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
