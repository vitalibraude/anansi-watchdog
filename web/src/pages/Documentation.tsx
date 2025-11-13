import React from 'react';
import { motion } from 'framer-motion';
import { Book, Code, Zap, Shield } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white"
      >
        <h1 className="text-4xl font-bold mb-2">📚 Documentation</h1>
        <p className="text-white/60">Learn how to use Anansi Watchdog</p>
      </motion.div>

      {/* Quick Start */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="text-purple-400" size={32} />
          <h2 className="text-2xl font-bold text-white">Quick Start</h2>
        </div>
        
        <div className="space-y-4 text-white/80">
          <div>
            <h3 className="font-semibold text-white mb-2">1. Installation</h3>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
              <code>{`git clone https://github.com/vitalibraude/anansi-watchdog.git
cd anansi-watchdog
pip install -r requirements.txt`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">2. Configuration</h3>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
              <code>{`cp .env.example .env
# Edit .env and add your API keys:
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
# GOOGLE_API_KEY=your_key_here`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">3. Run Tests</h3>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
              <code>{`python anansi.py -t tests/safety/*.json -m openai:gpt-4`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* API Usage */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <Code className="text-blue-400" size={32} />
          <h2 className="text-2xl font-bold text-white">API Usage</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">Python Example</h3>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm">
              <code className="text-purple-300">{`from core.model_interface import ModelFactory
from evaluators import SafetyEvaluator, BiasDetector

# Initialize model
model = ModelFactory.create('openai', 'gpt-4')

# Query model
response = model.query("Your prompt here")

# Evaluate
safety = SafetyEvaluator()
result = safety.evaluate(response.response)

print(f"Safety Score: {result['safety_score']}")
print(f"Risk Level: {result['risk_level']}")`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Test Categories */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="text-green-400" size={32} />
          <h2 className="text-2xl font-bold text-white">Test Categories</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'Safety Tests',
              desc: 'Harmful instructions, violence, illegal activities',
              count: '15+ tests'
            },
            {
              name: 'Bias Detection',
              desc: 'Gender, racial, age, socioeconomic bias',
              count: '24+ tests'
            },
            {
              name: 'Hallucination',
              desc: 'Fabricated facts, false citations, inaccuracies',
              count: '16+ tests'
            },
            {
              name: 'Privacy',
              desc: 'Data handling, personal information, surveillance',
              count: '8+ tests'
            },
            {
              name: 'Ethics',
              desc: 'Moral dilemmas, ethical reasoning',
              count: '8+ tests'
            },
            {
              name: 'Adversarial',
              desc: 'Jailbreak attempts, prompt injection',
              count: '8+ tests'
            },
          ].map((category, i) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <h3 className="font-semibold text-white mb-1">{category.name}</h3>
              <p className="text-white/60 text-sm mb-2">{category.desc}</p>
              <span className="text-purple-400 text-xs">{category.count}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <Book className="text-yellow-400" size={32} />
          <h2 className="text-2xl font-bold text-white">Architecture</h2>
        </div>
        
        <div className="text-white/80 space-y-4">
          <p>
            Anansi Watchdog consists of three core components:
          </p>
          
          <div className="space-y-3">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">1. Test Runner</h4>
              <p className="text-sm">
                Executes test scenarios across multiple AI models and collects responses in structured format.
              </p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">2. Evaluator Engine</h4>
              <p className="text-sm">
                Applies rule-based and ML analysis to detect safety violations, bias, and hallucinations.
              </p>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">3. Reporting Layer</h4>
              <p className="text-sm">
                Generates comprehensive reports in Markdown and JSON formats with actionable insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contributing */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-white font-bold mb-2">🤝 Contributing</h3>
        <p className="text-white/80 text-sm mb-4">
          Anansi Watchdog is open source and welcomes contributions! Check out our GitHub repository
          to get started.
        </p>
        <a
          href="https://github.com/vitalibraude/anansi-watchdog"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
