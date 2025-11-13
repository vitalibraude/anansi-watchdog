"""
Test Runner Engine

Executes test scenarios across multiple AI models and collects results.
"""

import json
import time
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime

from .model_interface import ModelInterface, ModelResponse


@dataclass
class TestCase:
    """Represents a single test case"""
    id: str
    category: str
    prompt: str
    expected_behavior: str
    tags: List[str]
    severity: str = "medium"  # low, medium, high, critical
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)


@dataclass
class TestResult:
    """Result of running a test case on a model"""
    test_id: str
    test_category: str
    model_name: str
    model_provider: str
    prompt: str
    response: str
    timestamp: float
    latency_ms: float
    passed: Optional[bool] = None
    evaluation_score: Optional[float] = None
    evaluation_details: Optional[Dict[str, Any]] = None
    flags: Optional[List[str]] = None
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)


class TestRunner:
    """Runs test scenarios across multiple AI models"""
    
    def __init__(self, models: Dict[str, ModelInterface], output_dir: str = "outputs"):
        """
        Initialize test runner
        
        Args:
            models: Dictionary of model name -> ModelInterface
            output_dir: Directory to save test results
        """
        self.models = models
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.results: List[TestResult] = []
        self.test_suite_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    def load_test_cases(self, test_file: str) -> List[TestCase]:
        """
        Load test cases from JSON file
        
        Args:
            test_file: Path to JSON file containing test cases
        
        Returns:
            List of TestCase objects
        """
        with open(test_file, 'r') as f:
            data = json.load(f)
        
        test_cases = []
        for item in data.get('tests', []):
            test_cases.append(TestCase(**item))
        
        return test_cases
    
    def run_single_test(
        self,
        test_case: TestCase,
        model: ModelInterface,
        **query_kwargs
    ) -> TestResult:
        """
        Run a single test case on a specific model
        
        Args:
            test_case: TestCase to run
            model: ModelInterface to test
            **query_kwargs: Additional arguments for model query
        
        Returns:
            TestResult
        """
        print(f"  Testing {model.model_name}...", end=" ")
        
        # Query the model
        response = model.query(test_case.prompt, **query_kwargs)
        
        # Create test result
        result = TestResult(
            test_id=test_case.id,
            test_category=test_case.category,
            model_name=response.model_name,
            model_provider=response.provider.value,
            prompt=test_case.prompt,
            response=response.response,
            timestamp=response.timestamp,
            latency_ms=response.latency_ms,
            error=response.error
        )
        
        if response.error:
            print(f"❌ Error: {response.error}")
        else:
            print(f"✅ Complete ({response.latency_ms:.0f}ms)")
        
        return result
    
    def run_test_suite(
        self,
        test_cases: List[TestCase],
        model_names: Optional[List[str]] = None,
        delay_between_tests: float = 1.0
    ) -> List[TestResult]:
        """
        Run multiple test cases across specified models
        
        Args:
            test_cases: List of TestCase objects to run
            model_names: List of model names to test (None = all models)
            delay_between_tests: Delay in seconds between API calls
        
        Returns:
            List of TestResult objects
        """
        models_to_test = model_names or list(self.models.keys())
        results = []
        
        print(f"\n{'='*60}")
        print(f"Running Test Suite: {self.test_suite_id}")
        print(f"Tests: {len(test_cases)}")
        print(f"Models: {len(models_to_test)}")
        print(f"{'='*60}\n")
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"[{i}/{len(test_cases)}] Test: {test_case.id} ({test_case.category})")
            
            for model_name in models_to_test:
                if model_name not in self.models:
                    print(f"  ⚠️  Model {model_name} not found, skipping...")
                    continue
                
                model = self.models[model_name]
                result = self.run_single_test(test_case, model)
                results.append(result)
                
                # Add delay to respect rate limits
                if delay_between_tests > 0:
                    time.sleep(delay_between_tests)
            
            print()  # Empty line between tests
        
        self.results.extend(results)
        return results
    
    def save_results(self, filename: Optional[str] = None) -> str:
        """
        Save test results to JSON file
        
        Args:
            filename: Custom filename (default: auto-generated)
        
        Returns:
            Path to saved file
        """
        if filename is None:
            filename = f"test_results_{self.test_suite_id}.json"
        
        output_path = self.output_dir / "data" / filename
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        output_data = {
            'test_suite_id': self.test_suite_id,
            'timestamp': datetime.now().isoformat(),
            'total_tests': len(self.results),
            'results': [result.to_dict() for result in self.results]
        }
        
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"\n✅ Results saved to: {output_path}")
        return str(output_path)
    
    def get_summary(self) -> Dict[str, Any]:
        """
        Get summary statistics of test results
        
        Returns:
            Dictionary with summary statistics
        """
        if not self.results:
            return {'total_tests': 0}
        
        # Group by model
        model_results = {}
        for result in self.results:
            model_name = result.model_name
            if model_name not in model_results:
                model_results[model_name] = {
                    'total': 0,
                    'errors': 0,
                    'avg_latency': 0,
                    'total_latency': 0
                }
            
            model_results[model_name]['total'] += 1
            if result.error:
                model_results[model_name]['errors'] += 1
            model_results[model_name]['total_latency'] += result.latency_ms
        
        # Calculate averages
        for model_name in model_results:
            stats = model_results[model_name]
            stats['avg_latency'] = stats['total_latency'] / stats['total']
            del stats['total_latency']
        
        # Group by category
        category_counts = {}
        for result in self.results:
            category = result.test_category
            category_counts[category] = category_counts.get(category, 0) + 1
        
        return {
            'test_suite_id': self.test_suite_id,
            'total_tests': len(self.results),
            'models_tested': len(model_results),
            'model_results': model_results,
            'category_breakdown': category_counts
        }
    
    def print_summary(self):
        """Print a formatted summary of test results"""
        summary = self.get_summary()
        
        print(f"\n{'='*60}")
        print("TEST SUITE SUMMARY")
        print(f"{'='*60}")
        print(f"Suite ID: {summary['test_suite_id']}")
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Models Tested: {summary['models_tested']}")
        
        print(f"\n{'Model Performance':^60}")
        print(f"{'-'*60}")
        for model_name, stats in summary.get('model_results', {}).items():
            print(f"{model_name:30} {stats['total']:>5} tests  "
                  f"{stats['avg_latency']:>7.0f}ms avg  "
                  f"{stats['errors']:>3} errors")
        
        print(f"\n{'Category Breakdown':^60}")
        print(f"{'-'*60}")
        for category, count in summary.get('category_breakdown', {}).items():
            print(f"{category:30} {count:>5} tests")
        
        print(f"{'='*60}\n")
