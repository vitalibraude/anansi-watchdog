"""
Anansi Watchdog - Test Runner Service
Execute tests against AI models
"""

import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import time

from models.database import TestScenario
# from core.model_interface import ModelFactory  # Import from original code


class TestRunnerService:
    """Service for running AI safety tests"""
    
    def __init__(self):
        self.model_factory = None  # ModelFactory() - would initialize with actual models
    
    async def run_tests(
        self,
        scenarios: List[TestScenario],
        model_provider: str,
        model_name: Optional[str] = None,
        parallel: bool = True,
        max_concurrent: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Run tests against AI model
        
        Args:
            scenarios: List of test scenarios to run
            model_provider: AI provider (openai, anthropic, google)
            model_name: Specific model name
            parallel: Whether to run tests in parallel
            max_concurrent: Maximum concurrent tests
            
        Returns:
            List of test results
        """
        if parallel:
            return await self._run_parallel(scenarios, model_provider, model_name, max_concurrent)
        else:
            return await self._run_sequential(scenarios, model_provider, model_name)
    
    async def _run_parallel(
        self,
        scenarios: List[TestScenario],
        model_provider: str,
        model_name: Optional[str],
        max_concurrent: int
    ) -> List[Dict[str, Any]]:
        """Run tests in parallel with concurrency limit"""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def run_with_semaphore(scenario):
            async with semaphore:
                return await self._run_single_test(scenario, model_provider, model_name)
        
        tasks = [run_with_semaphore(s) for s in scenarios]
        results = await asyncio.gather(*tasks)
        
        return results
    
    async def _run_sequential(
        self,
        scenarios: List[TestScenario],
        model_provider: str,
        model_name: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Run tests sequentially"""
        results = []
        
        for scenario in scenarios:
            result = await self._run_single_test(scenario, model_provider, model_name)
            results.append(result)
        
        return results
    
    async def _run_single_test(
        self,
        scenario: TestScenario,
        model_provider: str,
        model_name: Optional[str]
    ) -> Dict[str, Any]:
        """
        Run a single test
        
        This is a stub - in production, this would:
        1. Create model interface using ModelFactory
        2. Send prompt to AI model
        3. Get response
        4. Evaluate response using evaluators
        5. Return results
        """
        start_time = time.time()
        
        # Simulate API call
        await asyncio.sleep(0.1)  # Mock delay
        
        # Mock response - in production, would call actual model
        mock_response = f"This is a mock response to: {scenario.prompt[:50]}..."
        
        # Mock evaluation - in production, would use actual evaluators
        mock_evaluation = {
            "is_safe": True,
            "safety_score": 0.95,
            "violations": []
        }
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        return {
            "test_id": scenario.id,
            "model_id": "mock-model-id",  # Would be actual model ID
            "prompt": scenario.prompt,
            "response": mock_response,
            "safety_score": mock_evaluation["safety_score"],
            "is_safe": mock_evaluation["is_safe"],
            "violations": mock_evaluation["violations"],
            "latency_ms": latency_ms
        }
