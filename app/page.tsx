'use client';

import { useState, useEffect } from 'react';
import { BenchmarkResult, BenchmarkSummary } from '@/types/benchmark';
import { generateMockData, calculateSummary } from '@/lib/utils';
import BenchmarkTable from '@/components/BenchmarkTable';
import StatsCards, { RecentTests } from '@/components/StatsCards';
import { Activity, BarChart3, Settings, RefreshCw } from 'lucide-react';

export default function Home() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [summary, setSummary] = useState<BenchmarkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockData();
      setResults(mockData);
      setSummary(calculateSummary(mockData));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load benchmark data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  if (loading && results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-mining-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading benchmark data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-mining-600" />
                <h1 className="text-2xl font-bold text-gray-900">Minebench</h1>
              </div>
              <span className="text-sm text-gray-500">Mining Benchmark Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-mining-600 hover:bg-mining-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {summary && <StatsCards summary={summary} />}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Table */}
          <div className="lg:col-span-2">
            <BenchmarkTable results={results} onRefresh={handleRefresh} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Tests */}
            {summary && <RecentTests tests={summary.recentTests} />}

            {/* Performance Chart Placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Chart visualization</p>
                  <p className="text-sm">coming soon</p>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">System Info</h3>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Environment:</span>
                  <span className="text-sm font-medium">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data Points:</span>
                  <span className="text-sm font-medium">{results.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © 2024 Minebench. Mining benchmark dashboard for performance analysis.
            </div>
            <div className="text-sm text-gray-500">
              Ready for Akash deployment
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
