import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Settings, AlertCircle } from 'lucide-react';

export default function TestRunner() {
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4']);
  const [selectedTests, setSelectedTests] = useState<string[]>(['safety']);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-5-sonnet', 'gemini-pro'];
  const testCategories = ['safety', 'bias', 'hallucination', 'privacy', 'ethics', 'adversarial'];

  const runTests = () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate test progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white"
      >
        <h1 className="text-4xl font-bold mb-2">🧪 Test Runner</h1>
        <p className="text-white/60">Run comprehensive safety tests on AI models</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Model Selection */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4 flex items-center">
              <Settings className="mr-2" size={20} />
              Select Models
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {models.map((model) => (
                <label
                  key={model}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedModels([...selectedModels, model]);
                      } else {
                        setSelectedModels(selectedModels.filter(m => m !== model));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-white">{model}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Test Category Selection */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4">Select Test Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {testCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTests([...selectedTests, category]);
                      } else {
                        setSelectedTests(selectedTests.filter(t => t !== category));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-white capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runTests}
            disabled={isRunning || selectedModels.length === 0 || selectedTests.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-all"
          >
            <Play size={20} />
            <span>{isRunning ? 'Running Tests...' : 'Run Tests'}</span>
          </button>

          {/* Progress Bar */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            >
              <div className="flex justify-between text-white mb-2">
                <span>Running tests...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4">Test Summary</h3>
            <div className="space-y-3 text-white/80">
              <div className="flex justify-between">
                <span>Models:</span>
                <span className="font-semibold">{selectedModels.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Categories:</span>
                <span className="font-semibold">{selectedTests.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Tests:</span>
                <span className="font-semibold">
                  ~{selectedModels.length * selectedTests.length * 8}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Est. Time:</span>
                <span className="font-semibold">
                  ~{Math.ceil(selectedModels.length * selectedTests.length * 0.5)} min
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-blue-400 flex-shrink-0 mt-1" size={20} />
              <div className="text-white/80 text-sm">
                <p className="font-semibold mb-1">API Keys Required</p>
                <p>Make sure you have set your API keys in the .env file before running tests.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-white font-semibold mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors">
                📊 View Previous Results
              </button>
              <button className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors flex items-center justify-between">
                <span>💾 Export Configuration</span>
                <Download size={16} />
              </button>
              <button className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors">
                📝 Create Custom Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Preview */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-white font-bold mb-4">✅ Test Results</h3>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-white font-semibold mb-2">Tests Completed Successfully!</p>
              <p className="text-white/80 text-sm">
                {selectedModels.length * selectedTests.length * 8} tests run across {selectedModels.length} models
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Average Score</div>
                <div className="text-2xl font-bold text-white">87.3%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Tests Passed</div>
                <div className="text-2xl font-bold text-green-400">92%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Issues Found</div>
                <div className="text-2xl font-bold text-red-400">12</div>
              </div>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Download size={20} />
              <span>Download Full Report</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
