import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Shield, Activity, BarChart3, Settings, Github } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import ModelComparison from './pages/ModelComparison';
import TestRunner from './pages/TestRunner';
import Documentation from './pages/Documentation';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Navigation */}
          <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3">
                  <div className="text-4xl">🕷️</div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Anansi Watchdog</h1>
                    <p className="text-sm text-purple-300">AI Safety Evaluation Platform</p>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-6">
                  <NavLink to="/" icon={<Activity />} text="Dashboard" />
                  <NavLink to="/leaderboard" icon={<BarChart3 />} text="Leaderboard" />
                  <NavLink to="/compare" icon={<Shield />} text="Compare" />
                  <NavLink to="/test" icon={<Settings />} text="Test" />
                  <a 
                    href="https://github.com/vitalibraude/anansi-watchdog" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    <Github size={20} />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/compare" element={<ModelComparison />} />
              <Route path="/test" element={<TestRunner />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-16">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-between text-white/60">
                <p>Made with ❤️ for a safer AI future</p>
                <p>Open Source • MIT License</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
    >
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      <span>{text}</span>
    </Link>
  );
}

export default App;
