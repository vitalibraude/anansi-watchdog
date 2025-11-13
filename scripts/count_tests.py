#!/usr/bin/env python3
"""
Anansi Watchdog - Test Counter
Counts all test scenarios across all categories
"""

import json
import os
from pathlib import Path
from typing import Dict, List
from collections import defaultdict

def count_tests_in_file(file_path: Path) -> Dict:
    """Count tests in a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        category = data.get('category', 'unknown')
        tests = data.get('tests', [])
        
        return {
            'file': file_path.name,
            'category': category,
            'count': len(tests),
            'total_claimed': data.get('total_tests', len(tests))
        }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return {
            'file': file_path.name,
            'category': 'error',
            'count': 0,
            'total_claimed': 0
        }

def scan_test_directory(base_dir: str = 'tests') -> Dict:
    """Scan all test directories and count tests"""
    base_path = Path(base_dir)
    
    if not base_path.exists():
        print(f"Test directory '{base_dir}' not found!")
        return {}
    
    results = defaultdict(list)
    total_count = 0
    
    # Find all JSON files
    for json_file in base_path.rglob('*.json'):
        file_info = count_tests_in_file(json_file)
        category = file_info['category']
        results[category].append(file_info)
        total_count += file_info['count']
    
    return {
        'by_category': dict(results),
        'total_tests': total_count,
        'total_files': sum(len(files) for files in results.values())
    }

def print_report(results: Dict):
    """Print a formatted report"""
    print("=" * 80)
    print("ANANSI WATCHDOG - TEST SCENARIO REPORT")
    print("=" * 80)
    print()
    
    by_category = results.get('by_category', {})
    
    # Sort categories by test count
    sorted_categories = sorted(
        by_category.items(),
        key=lambda x: sum(f['count'] for f in x[1]),
        reverse=True
    )
    
    print(f"{'CATEGORY':<30} {'FILES':<8} {'TESTS':<8}")
    print("-" * 80)
    
    for category, files in sorted_categories:
        test_count = sum(f['count'] for f in files)
        file_count = len(files)
        print(f"{category:<30} {file_count:<8} {test_count:<8}")
        
        # Show individual files in category
        for file_info in files:
            filename = file_info['file']
            count = file_info['count']
            print(f"  └─ {filename:<40} {count:>5} tests")
    
    print("-" * 80)
    print(f"{'TOTAL':<30} {results['total_files']:<8} {results['total_tests']:<8}")
    print("=" * 80)
    print()
    
    # Goals and progress
    target_tests = 200
    current_tests = results['total_tests']
    progress_pct = (current_tests / target_tests) * 100
    
    print(f"PROGRESS TOWARD 200+ TEST GOAL:")
    print(f"  Current: {current_tests} tests")
    print(f"  Target:  {target_tests}+ tests")
    print(f"  Progress: {progress_pct:.1f}%")
    print(f"  Status: {'✅ GOAL MET!' if current_tests >= target_tests else f'⏳ {target_tests - current_tests} more needed'}")
    print()
    
    return current_tests >= target_tests

def main():
    """Main function"""
    print("Scanning test directories...\n")
    
    results = scan_test_directory('tests')
    
    if not results:
        print("No test files found!")
        return
    
    goal_met = print_report(results)
    
    # Additional statistics
    print("CATEGORY BREAKDOWN:")
    by_category = results.get('by_category', {})
    
    for category in sorted(by_category.keys()):
        files = by_category[category]
        test_count = sum(f['count'] for f in files)
        print(f"  • {category}: {test_count} tests")
    
    print()
    print("=" * 80)
    
    if goal_met:
        print("🎉 Congratulations! You've exceeded the 200 test scenario goal!")
    else:
        print("💪 Keep going! Add more test scenarios to reach the 200+ goal!")
    
    print("=" * 80)

if __name__ == '__main__':
    main()
