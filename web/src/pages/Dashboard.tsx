import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react';

// Mock API function (replace with real API calls)
const fetchDashboardData = async () => {
  // Simulated API response
  return {
    liveScores: [
      { model: 'GPT-4', overall: 0.891, safety: 0.92, bias: 0.88, hallucination: 0.87, tests: 150 },
      { model: 'Claude-3.5-Sonnet', overall: 0.875, safety: 0.90, bias: 0.89, hallucination: 0.84, tests: 145 },
      { model: 'Gemini-Pro', overall: 0.823, safety: 0.85, bias: 0.82, hallucination: 0.80, tests: 138 },
      { model: 'GPT-3.5-Turbo', overall: 0.756, safety: 0.78, bias: 0.75, hallucination: 0.74, tests: 142 },
    ],
    trends: [
      { date: '2024-01-01', gpt4: 0.88, claude: 0.87, gemini: 0.81 },
      { date: '2024-01-08', gpt4: 0.89, claude: 0.86, gemini: 0.82 },
      { date: '2024-01-15', gpt4: 0.89, claude: 0.88, gemini: 0.82 },
      { date: '2024-01-22', gpt4: 0.89, claude: 0.87, gemini: 0.82 },
    ],
    stats: {
      totalTests: 575,
      modelsMonitored: 4,
      avgSafetyScore: 0.862,
      criticalIssues: 3
    }
  };
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white"
      >
        <h1 className="text-4xl font-bold mb-2">Live AI Safety Dashboard</h1>
        <p className="text-white/60">Real-time monitoring of major AI models</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Activity />}
          title="Total Tests"
          value={data?.stats.totalTests.toLocaleString()}
          color="purple"
        />
        <StatCard
          icon={<Shield />}
          title="Models Monitored"
          value={data?.stats.modelsMonitored}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle />}
          title="Avg Safety Score"
          value={(data?.stats.avgSafetyScore * 100).toFixed(1) + '%'}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle />}
          title="Critical Issues"
          value={data?.stats.criticalIssues}
          color="red"
        />
      </div>

      {/* Live Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Activity className="mr-2" />
          Live Model Scores
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.liveScores.map((model, index) => (
            <ModelCard key={model.model} model={model} delay={index * 0.1} />
          ))}
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2" />
            Score Trends (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#fff" />
              <YAxis stroke="#fff" domain={[0.7, 1.0]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
              />
              <Legend />
              <Line type="monotone" dataKey="gpt4" stroke="#8b5cf6" strokeWidth={2} name="GPT-4" />
              <Line type="monotone" dataKey="claude" stroke="#3b82f6" strokeWidth={2} name="Claude" />
              <Line type="monotone" dataKey="gemini" stroke="#10b981" strokeWidth={2} name="Gemini" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">Multi-Dimensional Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { metric: 'Safety', gpt4: 92, claude: 90, gemini: 85 },
              { metric: 'Bias', gpt4: 88, claude: 89, gemini: 82 },
              { metric: 'Hallucination', gpt4: 87, claude: 84, gemini: 80 },
              { metric: 'Helpfulness', gpt4: 91, claude: 90, gemini: 87 },
              { metric: 'Consistency', gpt4: 89, claude: 88, gemini: 84 },
            ]}>
              <PolarGrid stroke="#ffffff40" />
              <PolarAngleAxis dataKey="metric" stroke="#fff" />
              <PolarRadiusAxis stroke="#fff" domain={[0, 100]} />
              <Radar name="GPT-4" dataKey="gpt4" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Radar name="Claude" dataKey="claude" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Gemini" dataKey="gemini" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-bold text-white mb-4">Test Category Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[
            { category: 'Safety', tests: 145, passed: 138 },
            { category: 'Bias', tests: 128, passed: 115 },
            { category: 'Hallucination', tests: 156, passed: 142 },
            { category: 'Privacy', tests: 89, passed: 85 },
            { category: 'Ethics', tests: 57, passed: 52 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="category" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
            <Legend />
            <Bar dataKey="tests" fill="#8b5cf6" name="Total Tests" />
            <Bar dataKey="passed" fill="#10b981" name="Passed" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-700',
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    red: 'from-red-500 to-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        {React.cloneElement(icon, { size: 32, className: 'opacity-80' })}
      </div>
      <p className="text-sm opacity-80 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}

function ModelCard({ model, delay }: any) {
  const getScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-green-400';
    if (score >= 0.70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/30 transition-all"
    >
      <h3 className="text-lg font-bold text-white mb-3">{model.model}</h3>
      
      <div className="space-y-2">
        <ScoreBar label="Overall" score={model.overall} color={getScoreColor(model.overall)} />
        <ScoreBar label="Safety" score={model.safety} color="text-purple-400" />
        <ScoreBar label="Bias" score={model.bias} color="text-blue-400" />
        <ScoreBar label="Hallucination" score={model.hallucination} color="text-green-400" />
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
        {model.tests} tests completed
      </div>
    </motion.div>
  );
}

function ScoreBar({ label, score, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>{label}</span>
        <span className={color}>{(score * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${color.replace('text', 'bg')}`}
        />
      </div>
    </div>
  );
}
