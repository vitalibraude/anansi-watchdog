import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

const availableModels = [
  { id: 'gpt4', name: 'GPT-4', provider: 'OpenAI', color: '#8b5cf6' },
  { id: 'claude', name: 'Claude-3.5-Sonnet', provider: 'Anthropic', color: '#3b82f6' },
  { id: 'gemini', name: 'Gemini-Pro', provider: 'Google', color: '#10b981' },
  { id: 'gpt35', name: 'GPT-3.5-Turbo', provider: 'OpenAI', color: '#f59e0b' },
];

const comparisonData = {
  radar: [
    { metric: 'Safety', gpt4: 92, claude: 90, gemini: 85, gpt35: 78 },
    { metric: 'Bias Detection', gpt4: 88, claude: 89, gemini: 82, gpt35: 75 },
    { metric: 'Hallucination', gpt4: 87, claude: 84, gemini: 80, gpt35: 74 },
    { metric: 'Helpfulness', gpt4: 91, claude: 90, gemini: 87, gpt35: 84 },
    { metric: 'Consistency', gpt4: 89, claude: 88, gemini: 84, gpt35: 76 },
    { metric: 'Ethics', gpt4: 90, claude: 92, gemini: 86, gpt35: 79 },
  ],
  categories: [
    { name: 'Safety Tests', gpt4: 138, claude: 131, gemini: 117, gpt35: 110 },
    { name: 'Bias Tests', gpt4: 132, claude: 129, gemini: 118, gpt35: 107 },
    { name: 'Hallucination', gpt4: 142, claude: 136, gemini: 124, gpt35: 115 },
    { name: 'Privacy', gpt4: 85, claude: 82, gemini: 78, gpt35: 71 },
    { name: 'Ethics', gpt4: 52, claude: 54, gemini: 49, gpt35: 44 },
  ],
  trends: [
    { month: 'Oct', gpt4: 0.88, claude: 0.86, gemini: 0.81, gpt35: 0.74 },
    { month: 'Nov', gpt4: 0.89, claude: 0.87, gemini: 0.82, gpt35: 0.75 },
    { month: 'Dec', gpt4: 0.89, claude: 0.87, gemini: 0.82, gpt35: 0.76 },
    { month: 'Jan', gpt4: 0.89, claude: 0.88, gemini: 0.82, gpt35: 0.76 },
  ],
};

const detailedComparison = {
  gpt4: {
    strengths: ['Highest safety scores', 'Excellent consistency', 'Best hallucination detection'],
    weaknesses: ['Occasional bias in professional contexts', 'Can be overly cautious'],
    unique: 'Industry-leading safety measures',
    passRate: 0.92,
    avgLatency: 1234,
    costPer1k: 0.03
  },
  claude: {
    strengths: ['Best ethics scores', 'Excellent bias detection', 'Nuanced responses'],
    weaknesses: ['Slightly lower hallucination detection', 'Can be verbose'],
    unique: 'Constitutional AI approach',
    passRate: 0.90,
    avgLatency: 987,
    costPer1k: 0.024
  },
  gemini: {
    strengths: ['Good overall balance', 'Fast responses', 'Cost-effective'],
    weaknesses: ['Lower safety scores', 'More hallucinations', 'Bias in some areas'],
    unique: 'Multimodal capabilities',
    passRate: 0.85,
    avgLatency: 756,
    costPer1k: 0.015
  },
  gpt35: {
    strengths: ['Very fast', 'Most cost-effective', 'Good for simple tasks'],
    weaknesses: ['Lower across all safety metrics', 'More frequent hallucinations'],
    unique: 'Best price-performance ratio',
    passRate: 0.76,
    avgLatency: 543,
    costPer1k: 0.002
  },
};

export default function ModelComparison() {
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt4', 'claude', 'gemini']);
  const [comparisonView, setComparisonView] = useState<'radar' | 'bar' | 'detailed'>('radar');

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      }
    } else {
      if (selectedModels.length < 4) {
        setSelectedModels([...selectedModels, modelId]);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white"
      >
        <h1 className="text-4xl font-bold mb-2">⚔️ Model Comparison</h1>
        <p className="text-white/60">Compare AI models side-by-side across all metrics</p>
      </motion.div>

      {/* Model Selector */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4">Select Models to Compare (up to 4)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {availableModels.map((model) => (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleModel(model.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedModels.includes(model.id)
                  ? 'border-white bg-white/10'
                  : 'border-white/20 bg-white/5 opacity-50'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full mb-2 mx-auto"
                style={{ backgroundColor: model.color }}
              />
              <div className="text-white font-semibold text-sm">{model.name}</div>
              <div className="text-white/60 text-xs">{model.provider}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* View Selector */}
      <div className="flex space-x-2">
        {[
          { id: 'radar', label: 'Radar Chart', icon: '📊' },
          { id: 'bar', label: 'Category Breakdown', icon: '📈' },
          { id: 'detailed', label: 'Detailed Comparison', icon: '🔍' },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setComparisonView(view.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              comparisonView === view.id
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <span>{view.icon}</span>
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Radar Chart View */}
      {comparisonView === 'radar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">Multi-Dimensional Comparison</h3>
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={comparisonData.radar}>
              <PolarGrid stroke="#ffffff40" />
              <PolarAngleAxis dataKey="metric" stroke="#fff" />
              <PolarRadiusAxis stroke="#fff" domain={[0, 100]} />
              {selectedModels.map((modelId) => {
                const model = availableModels.find(m => m.id === modelId)!;
                return (
                  <Radar
                    key={modelId}
                    name={model.name}
                    dataKey={modelId}
                    stroke={model.color}
                    fill={model.color}
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                );
              })}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Bar Chart View */}
      {comparisonView === 'bar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData.categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
              <Legend />
              {selectedModels.map((modelId) => {
                const model = availableModels.find(m => m.id === modelId)!;
                return (
                  <Bar
                    key={modelId}
                    dataKey={modelId}
                    fill={model.color}
                    name={model.name}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>

          {/* Trend Chart */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Score Trends (4 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparisonData.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" domain={[0.7, 1.0]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
                <Legend />
                {selectedModels.map((modelId) => {
                  const model = availableModels.find(m => m.id === modelId)!;
                  return (
                    <Line
                      key={modelId}
                      type="monotone"
                      dataKey={modelId}
                      stroke={model.color}
                      strokeWidth={2}
                      name={model.name}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Detailed Comparison View */}
      {comparisonView === 'detailed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedModels.map((modelId, index) => {
            const model = availableModels.find(m => m.id === modelId)!;
            const details = detailedComparison[modelId];
            
            return (
              <motion.div
                key={modelId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{model.name}</h3>
                    <p className="text-white/60 text-sm">{model.provider}</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                </div>

                <div className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/20">
                    <div>
                      <div className="text-white/60 text-xs mb-1">Pass Rate</div>
                      <div className="text-white font-bold">{(details.passRate * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-xs mb-1">Latency</div>
                      <div className="text-white font-bold">{details.avgLatency}ms</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-xs mb-1">Cost/1K</div>
                      <div className="text-white font-bold">${details.costPer1k}</div>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="text-green-400" size={18} />
                      <h4 className="text-white font-semibold">Strengths</h4>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {details.strengths.map((strength, i) => (
                        <li key={i} className="text-white/80 text-sm">• {strength}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="text-yellow-400" size={18} />
                      <h4 className="text-white font-semibold">Weaknesses</h4>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {details.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-white/80 text-sm">• {weakness}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Unique Feature */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="text-purple-400" size={16} />
                      <span className="text-white/60 text-xs font-semibold">UNIQUE FEATURE</span>
                    </div>
                    <p className="text-white text-sm">{details.unique}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recommendation Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6"
      >
        <h3 className="text-white font-bold mb-2">💡 Choosing the Right Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-sm">
          <div>
            <strong>For maximum safety:</strong> GPT-4 or Claude-3.5-Sonnet
          </div>
          <div>
            <strong>For best value:</strong> Gemini-Pro or GPT-3.5-Turbo
          </div>
          <div>
            <strong>For ethical reasoning:</strong> Claude-3.5-Sonnet
          </div>
          <div>
            <strong>For speed:</strong> GPT-3.5-Turbo or Gemini-Pro
          </div>
        </div>
      </motion.div>
    </div>
  );
}
