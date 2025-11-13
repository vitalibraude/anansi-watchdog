import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, TrendingDown } from 'lucide-react';

const leaderboardData = [
  {
    rank: 1,
    model: 'GPT-4',
    provider: 'OpenAI',
    overall: 0.891,
    safety: 0.92,
    bias: 0.88,
    hallucination: 0.87,
    tests: 150,
    passRate: 0.92,
    trend: 'up',
    change: 0.012
  },
  {
    rank: 2,
    model: 'Claude-3.5-Sonnet',
    provider: 'Anthropic',
    overall: 0.875,
    safety: 0.90,
    bias: 0.89,
    hallucination: 0.84,
    tests: 145,
    passRate: 0.90,
    trend: 'up',
    change: 0.008
  },
  {
    rank: 3,
    model: 'Gemini-Pro',
    provider: 'Google',
    overall: 0.823,
    safety: 0.85,
    bias: 0.82,
    hallucination: 0.80,
    tests: 138,
    passRate: 0.85,
    trend: 'stable',
    change: 0.002
  },
  {
    rank: 4,
    model: 'GPT-3.5-Turbo',
    provider: 'OpenAI',
    overall: 0.756,
    safety: 0.78,
    bias: 0.75,
    hallucination: 0.74,
    tests: 142,
    passRate: 0.76,
    trend: 'down',
    change: -0.015
  },
  {
    rank: 5,
    model: 'Claude-3-Opus',
    provider: 'Anthropic',
    overall: 0.845,
    safety: 0.88,
    bias: 0.85,
    hallucination: 0.81,
    tests: 129,
    passRate: 0.87,
    trend: 'up',
    change: 0.019
  },
];

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<'overall' | 'safety' | 'bias' | 'hallucination'>('overall');
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={32} />;
    if (rank === 2) return <Medal className="text-gray-300" size={32} />;
    if (rank === 3) return <Award className="text-amber-600" size={32} />;
    return <span className="text-2xl font-bold text-white/40">#{rank}</span>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="text-green-400" size={20} />;
    if (trend === 'down') return <TrendingDown className="text-red-400" size={20} />;
    return <span className="text-white/40">→</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white"
      >
        <h1 className="text-4xl font-bold mb-2">🏆 Model Leaderboard</h1>
        <p className="text-white/60">Rankings based on comprehensive safety evaluations</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-white/60">Period:</span>
          {['7d', '30d', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {p === 'all' ? 'All Time' : p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-white/60">Sort by:</span>
          {['overall', 'safety', 'bias', 'hallucination'].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s as any)}
              className={`px-4 py-2 rounded-lg transition-all capitalize ${
                sortBy === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Podium - Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaderboardData.slice(0, 3).map((model, index) => (
          <motion.div
            key={model.model}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative ${
              index === 0 ? 'md:order-2 md:scale-110' : index === 1 ? 'md:order-1' : 'md:order-3'
            }`}
          >
            <div className={`
              bg-gradient-to-br rounded-xl p-6 border-2 shadow-2xl
              ${index === 0 ? 'from-yellow-500/20 to-yellow-700/20 border-yellow-400' : ''}
              ${index === 1 ? 'from-gray-500/20 to-gray-700/20 border-gray-400' : ''}
              ${index === 2 ? 'from-amber-500/20 to-amber-700/20 border-amber-600' : ''}
            `}>
              <div className="flex justify-center mb-4">
                {getRankIcon(model.rank)}
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">{model.model}</h3>
              <p className="text-white/60 text-center text-sm mb-4">{model.provider}</p>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-white">{(model.overall * 100).toFixed(1)}</div>
                <div className="text-white/60 text-sm">Overall Score</div>
              </div>

              <div className="space-y-2 text-sm">
                <ScoreRow label="Safety" score={model.safety} />
                <ScoreRow label="Bias" score={model.bias} />
                <ScoreRow label="Hallucination" score={model.hallucination} />
              </div>

              <div className="mt-4 pt-4 border-t border-white/20 text-center">
                <div className="text-white/60 text-xs">
                  {model.tests} tests • {(model.passRate * 100).toFixed(0)}% pass rate
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/20">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">Rank</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Model</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Overall</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Safety</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Bias</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Hallucination</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Tests</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Pass Rate</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((model, index) => (
                <motion.tr
                  key={model.model}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {model.rank <= 3 ? (
                        getRankIcon(model.rank)
                      ) : (
                        <span className="text-xl font-bold text-white/60">#{model.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-semibold">{model.model}</div>
                      <div className="text-white/60 text-sm">{model.provider}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold text-white">{(model.overall * 100).toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ScorePill score={model.safety} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ScorePill score={model.bias} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ScorePill score={model.hallucination} />
                  </td>
                  <td className="px-6 py-4 text-center text-white/80">{model.tests}</td>
                  <td className="px-6 py-4 text-center text-white/80">
                    {(model.passRate * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      {getTrendIcon(model.trend)}
                      <span className={`text-sm ${
                        model.change > 0 ? 'text-green-400' : model.change < 0 ? 'text-red-400' : 'text-white/60'
                      }`}>
                        {model.change > 0 ? '+' : ''}{(model.change * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-white/80"
      >
        <p className="text-sm">
          <strong>How rankings work:</strong> Models are evaluated across multiple dimensions including safety, bias, and
          hallucination detection. Scores are updated daily based on continuous testing across diverse scenarios.
        </p>
      </motion.div>
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/60">{label}</span>
      <span className="text-white font-semibold">{(score * 100).toFixed(1)}%</span>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 0.85) return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (s >= 0.70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getColor(score)}`}>
      {(score * 100).toFixed(1)}%
    </span>
  );
}
